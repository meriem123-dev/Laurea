import {
  BadRequestException,
  ConflictException,
  Injectable,
} from "@nestjs/common";
import { Readable } from "node:stream";
import * as ExcelJS from "exceljs";
import { PrismaService } from "../prisma/prisma.service";
import { Cursus, Speciality } from "../generated/prisma/client";
import { StudentsService } from "./students.service";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { CreateStudentDto } from "./dto/create-student.dto";

//inetrfaces
export interface ImportError {
  line: number;
  message: string;
}
export interface ImportResult {
  total: number;
  created: number;
  emailsFailed: number; // comptes créés mais invitation non envoyée
  errors: ImportError[];
}

interface ParsedRow {
  line: number;
  firstName: string;
  lastName: string;
  email: string;
  matricule: string;
  speciality: Speciality;
  group: string | null;
  cursus: Cursus;
}

const MAX_ROWS = 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// "Génie logiciel" -> "genie logiciel"
const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

// En-têtes acceptés (sans accents, en minuscules)
const HEADERS: Record<string, string> = {
  nom: "lastName",
  prenom: "firstName",
  email: "email",
  matricule: "matricule",
  specialite: "speciality",
  groupe: "group",
  cursus: "cursus",
};

//  aligner avec SPECIALITY_LABELS du front
const SPECIALITY_LABELS: Record<Speciality, string> = {
  RESEAUX_SEC: "Réseaux et sécurité",
  DATA_SCIENCE: "Data science",
  GENIE_LOGICIEL: "Génie logiciel",
  INTELLIGENCE_ARTIFICIELLE: "Intelligence artificielle",
  SYSTEMES_INFORMATION: "Systèmes d'information",
};

//mapping specialité et cursus
const SPECIALITY_MAP = new Map<string, Speciality>();
for (const [value, label] of Object.entries(SPECIALITY_LABELS)) {
  SPECIALITY_MAP.set(norm(value), value as Speciality); // accepte aussi l'enum brut
  SPECIALITY_MAP.set(norm(label), value as Speciality);
}

const CURSUS_MAP = new Map<string, Cursus>([
  ["master", Cursus.MASTER],
  ["ingenieur", Cursus.INGENIEUR],
]);

//convertir la cell en texte
function cellText(v: ExcelJS.CellValue): string {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "object") {
    const o = v as any;
    if (o.text) return String(o.text); // lien hypertexte (Excel transforme souvent les emails)
    if (o.richText) return o.richText.map((r: any) => r.text).join("");
    if ("result" in o) return String(o.result ?? ""); // formule
    return "";
  }
  return String(v);
}

@Injectable()
export class StudentsImportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly students: StudentsService,
  ) {}

  async import(file: Express.Multer.File): Promise<ImportResult> {
    const rawRows = await this.readRows(file);
    if (rawRows.length === 0) {
      throw new BadRequestException("Le fichier ne contient aucune ligne.");
    }
    if (rawRows.length > MAX_ROWS) {
      throw new BadRequestException(`Maximum ${MAX_ROWS} lignes par import.`);
    }

    const errors: ImportError[] = [];
    const valid: ParsedRow[] = [];

    // 1. Validation de forme + doublons dans le fichier
    const seenEmails = new Set<string>();
    const seenMatricules = new Set<string>();

    for (const { line, data } of rawRows) {
      const get = (k: string) => (data[k] ?? "").trim();

      const email = get("email").toLowerCase();
      const matricule = get("matricule");
      const rawSpeciality = get("speciality");
      const rawCursus = get("cursus");

      // On convertit les libellés Excel en enums ; si inconnu, on laisse la valeur brute
      // pour que le DTO produise l'erreur "Spécialité invalide" / "Cursus invalide"
      const dto = plainToInstance(CreateStudentDto, {
        firstName: get("firstName"),
        lastName: get("lastName"),
        email,
        matricule,
        group: get("group") || undefined,
        speciality: SPECIALITY_MAP.get(norm(rawSpeciality)) ?? rawSpeciality,
        cursus: CURSUS_MAP.get(norm(rawCursus)) ?? rawCursus,
      });

      // mêmes règles que le formulaire
      const problems = validateSync(dto).flatMap((e) =>
        Object.values(e.constraints ?? {}),
      );

      // doublons dans le fichier
      if (email && seenEmails.has(email))
        problems.push("email en double dans le fichier");
      if (matricule && seenMatricules.has(matricule))
        problems.push("matricule en double dans le fichier");
      if (email) seenEmails.add(email);
      if (matricule) seenMatricules.add(matricule);

      if (problems.length) {
        errors.push({ line, message: problems.join(", ") });
      } else {
        valid.push({
          line,
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          matricule: dto.matricule,
          speciality: dto.speciality,
          cursus: dto.cursus,
          group: dto.group ?? null,
        });
      }
    }
    // 2. Doublons en base (une seule requête par champ)
    const [usersInDb, studentsInDb] = await Promise.all([
      this.prisma.user.findMany({
        where: { email: { in: valid.map((r) => r.email) } },
        select: { email: true },
      }),
      this.prisma.student.findMany({
        where: { matricule: { in: valid.map((r) => r.matricule) } },
        select: { matricule: true },
      }),
    ]);
    const takenEmails = new Set(usersInDb.map((u) => u.email));
    const takenMatricules = new Set(studentsInDb.map((s) => s.matricule));

    const toCreate = valid.filter((r) => {
      const problems: string[] = [];
      if (takenEmails.has(r.email)) problems.push("email déjà utilisé");
      if (takenMatricules.has(r.matricule))
        problems.push("matricule déjà utilisé");
      if (problems.length)
        errors.push({ line: r.line, message: problems.join(", ") });
      return problems.length === 0;
    });

    // 3. Création via le service existant (compte PENDING + mail d'activation)
    let created = 0;
    let emailsFailed = 0;

    for (const r of toCreate) {
      try {
        const student = await this.students.create({
          firstName: r.firstName,
          lastName: r.lastName,
          email: r.email,
          matricule: r.matricule,
          speciality: r.speciality,
          cursus: r.cursus,
          group: r.group ?? undefined,
        });
        created++;
        if (!student.emailSent) emailsFailed++;
      } catch (e) {
        errors.push({
          line: r.line,
          message:
            e instanceof ConflictException
              ? "email ou matricule déjà utilisé"
              : "erreur lors de la création",
        });
      }
    }

    errors.sort((a, b) => a.line - b.line);
    return { total: rawRows.length, created, emailsFailed, errors };
  }

  async buildTemplate(): Promise<ExcelJS.Workbook> {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Étudiants");
    ws.columns = [
      { header: "nom", key: "nom", width: 20 },
      { header: "prénom", key: "prenom", width: 20 },
      { header: "email", key: "email", width: 30 },
      { header: "matricule", key: "matricule", width: 16 },
      { header: "spécialité", key: "specialite", width: 28 },
      { header: "groupe", key: "groupe", width: 10 },
      { header: "cursus", key: "cursus", width: 14 },
    ];
    ws.getRow(1).font = { bold: true };
    ws.addRow({
      nom: "HM",
      prenom: "Meriem",
      email: "meriem.hm@univ-bejaia.dz",
      matricule: "33001234",
      specialite: "Génie logiciel",
      groupe: "G1",
      cursus: "Ingénieur",
    });

    // Listes déroulantes pour éviter les fautes de frappe (lignes 2 à 500)
    for (let i = 2; i <= 500; i++) {
      ws.getCell(`E${i}`).dataValidation = {
        type: "list",
        allowBlank: false,
        formulae: [`"${Object.values(SPECIALITY_LABELS).join(",")}"`],
      };
      ws.getCell(`G${i}`).dataValidation = {
        type: "list",
        allowBlank: false,
        formulae: ['"Master,Ingénieur"'],
      };
    }
    return wb;
  }

  // Lecture xlsx ou csv -> lignes { champ interne: texte }
  private async readRows(file: Express.Multer.File) {
    const wb = new ExcelJS.Workbook();
    const isCsv = file.originalname.toLowerCase().endsWith(".csv");

    try {
      if (isCsv) {
        // Excel FR exporte les CSV avec ";"
        const firstLine = file.buffer.toString("utf8").split(/\r?\n/)[0] ?? "";
        const delimiter = firstLine.includes(";") ? ";" : ",";
        await wb.csv.read(Readable.from(file.buffer), {
          parserOptions: { delimiter },
        });
      } else {
        await wb.xlsx.load(file.buffer as unknown as ExcelJS.Buffer);
      }
    } catch {
      throw new BadRequestException(
        "Fichier illisible. Utilise le modèle .xlsx ou un .csv.",
      );
    }

    const ws = wb.worksheets[0];
    if (!ws) throw new BadRequestException("Fichier vide.");

    // En-têtes -> index de colonne (l'ordre des colonnes n'a pas d'importance)
    const colToField = new Map<number, string>();
    ws.getRow(1).eachCell((cell, col) => {
      const field = HEADERS[norm(cellText(cell.value))];
      if (field) colToField.set(col, field);
    });

    const missing = Object.entries(HEADERS)
      .filter(([, f]) => f !== "group" && ![...colToField.values()].includes(f))
      .map(([h]) => h);
    if (missing.length) {
      throw new BadRequestException(
        `Colonnes manquantes : ${missing.join(", ")}.`,
      );
    }

    const rows: { line: number; data: Record<string, string> }[] = [];
    ws.eachRow((row, line) => {
      if (line === 1) return;
      const data: Record<string, string> = {};
      colToField.forEach((field, col) => {
        data[field] = cellText(row.getCell(col).value);
      });
      if (Object.values(data).every((v) => !v.trim())) return; // ligne vide
      rows.push({ line, data });
    });
    return rows;
  }
}
