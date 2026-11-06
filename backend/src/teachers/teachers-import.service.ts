import {
  BadRequestException,
  ConflictException,
  Injectable,
} from "@nestjs/common";
import { Readable } from "node:stream";
import * as ExcelJS from "exceljs";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { PrismaService } from "../prisma/prisma.service";
import { TeachersService } from "./teachers.service";
import { CreateTeacherDto, ProfessorTitle } from "./dto/create-teacher.dto";

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
  title?: ProfessorTitle;
  specialty: string;
}

const MAX_ROWS = 1000;

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
  titre: "title", // facultatif
  specialite: "specialty",
};

// "Pr", "pr.", "Professeur" -> "Pr." ; "Dr", "Docteur" -> "Dr."
const TITLE_MAP = new Map<string, ProfessorTitle>([
  ["pr", "Pr."],
  ["professeur", "Pr."],
  ["dr", "Dr."],
  ["docteur", "Dr."],
]);

// convertir la cellule en texte
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
export class TeachersImportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly teachers: TeachersService,
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

    for (const { line, data } of rawRows) {
      const get = (k: string) => (data[k] ?? "").trim();

      const email = get("email").toLowerCase();
      const rawTitle = get("title");

      // titre inconnu -> valeur brute, pour que le DTO produise "Titre invalide"
      const dto = plainToInstance(CreateTeacherDto, {
        firstName: get("firstName"),
        lastName: get("lastName"),
        email,
        title: rawTitle
          ? (TITLE_MAP.get(norm(rawTitle)) ?? rawTitle)
          : undefined,
        specialty: get("specialty"),
      });

      // mêmes règles que le formulaire
      const problems = validateSync(dto).flatMap((e) =>
        Object.values(e.constraints ?? {}),
      );

      if (email && seenEmails.has(email))
        problems.push("email en double dans le fichier");
      if (email) seenEmails.add(email);

      if (problems.length) {
        errors.push({ line, message: problems.join(", ") });
      } else {
        valid.push({
          line,
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          title: dto.title,
          specialty: dto.specialty,
        });
      }
    }

    // 2. Doublons en base (une seule requête)
    const usersInDb = await this.prisma.user.findMany({
      where: { email: { in: valid.map((r) => r.email) } },
      select: { email: true },
    });
    const takenEmails = new Set(usersInDb.map((u) => u.email));

    const toCreate = valid.filter((r) => {
      if (takenEmails.has(r.email)) {
        errors.push({ line: r.line, message: "email déjà utilisé" });
        return false;
      }
      return true;
    });

    // 3. Création via le service (compte PENDING + mail d'activation)
    let created = 0;
    let emailsFailed = 0;

    for (const r of toCreate) {
      try {
        const teacher = await this.teachers.create({
          firstName: r.firstName,
          lastName: r.lastName,
          email: r.email,
          title: r.title,
          specialty: r.specialty,
        });
        created++;
        if (!teacher.emailSent) emailsFailed++;
      } catch (e) {
        errors.push({
          line: r.line,
          message:
            e instanceof ConflictException
              ? "email déjà utilisé"
              : "erreur lors de la création",
        });
      }
    }

    errors.sort((a, b) => a.line - b.line);
    return { total: rawRows.length, created, emailsFailed, errors };
  }

  async buildTemplate(): Promise<ExcelJS.Workbook> {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Enseignants");
    ws.columns = [
      { header: "nom", key: "nom", width: 20 },
      { header: "prénom", key: "prenom", width: 20 },
      { header: "email", key: "email", width: 30 },
      { header: "titre", key: "titre", width: 10 },
      { header: "spécialité", key: "specialite", width: 28 },
    ];
    ws.getRow(1).font = { bold: true };
    ws.addRow({
      nom: "Mansouri",
      prenom: "Karim",
      email: "karim.mansouri@univ-bejaia.dz",
      titre: "Pr.",
      specialite: "Génie logiciel",
    });

    // Liste déroulante pour le titre (lignes 2 à 500)
    for (let i = 2; i <= 500; i++) {
      ws.getCell(`D${i}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: ['"Pr.,Dr."'],
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

    // le titre est facultatif : on ne l'exige pas
    const missing = Object.entries(HEADERS)
      .filter(([, f]) => f !== "title" && ![...colToField.values()].includes(f))
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
