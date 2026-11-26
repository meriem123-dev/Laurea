import "dotenv/config";
import { AdminType, PrismaClient, Role } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as argon2 from "argon2";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  // en minuscules, parce que findByEmail fait toLowerCase
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("email et mot de passe obligatoires ! ");
  }

  await prisma.user.upsert({
    where: { email },
    update: {}, // si l'admin existe déjà, on touche à rien
    create: {
      email,
      passwordHash: await argon2.hash(password),
      firstName: "Admin",
      lastName: "Système",
      role: Role.ADMIN_STAFF,
      isSystemAdmin: true,
      adminType: AdminType.ADMINISTRATION,
    },
  });

  const roomsSeed = [
    {
      name: "Salle A12",
      block: "Bâtiment Sciences",
      pole: "",
      equipment: "Vidéoprojecteur, tableau",
      capacity: 24,
      tone: "blue",
    },
    {
      name: "Amphi B",
      block: "Bâtiment Central",
      pole: "",
      equipment: "Vidéoconférence, sonorisation, micro",
      capacity: 120,
      tone: "violet",
    },
    {
      name: "Salle C04",
      block: "",
      pole: "Pôle Numérique",
      equipment: "Vidéoprojecteur, visioconférence",
      capacity: 32,
      tone: "green",
    },
    {
      name: "Salle A08",
      block: "Bâtiment Sciences",
      pole: "",
      equipment: "Tableau",
      capacity: 20,
      tone: "orange",
    },
  ];

  for (const room of roomsSeed) {
    await prisma.room.upsert({
      where: { name: room.name },
      update: {},
      create: room,
    });
  }

  // Données de démo : uniquement si SEED_DEMO_DATA=true (jamais en prod)
  if (process.env.SEED_DEMO_DATA === "true") {
    const demoHash = await argon2.hash(
      process.env.DEMO_PASSWORD ?? "Demo-1234!",
    );
    const PROJECT_ID = "11111111-1111-4111-8111-111111111111";

    const teachers = [
      {
        email: "pr.benali@demo.local",
        firstName: "Samir",
        lastName: "Benali",
        title: "Pr.",
        specialty: "Génie logiciel",
      },
      {
        email: "dr.hamidi@demo.local",
        firstName: "Nadia",
        lastName: "Hamidi",
        title: "Dr.",
        specialty: "Data science",
      },
      {
        email: "dr.messaoud@demo.local",
        firstName: "Karim",
        lastName: "Messaoud",
        title: "Dr.",
        specialty: "Réseaux et sécurité",
      },
      {
        email: "dr.rahmani@demo.local",
        firstName: "Lina",
        lastName: "Rahmani",
        title: "Dr.",
        specialty: "Systèmes d’information",
      },
    ];
    const teacherIds: string[] = [];
    for (const t of teachers) {
      const u = await prisma.user.upsert({
        where: { email: t.email },
        update: {},
        create: {
          email: t.email,
          firstName: t.firstName,
          lastName: t.lastName,
          role: Role.TEACHER,
          passwordHash: demoHash,
          teacher: {
            create: {
              title: t.title,
              specialty: t.specialty,
              accountStatus: "ACTIVE",
            },
          },
        },
        include: { teacher: true },
      });
      teacherIds.push(u.teacher!.id);
    }

    await prisma.project.upsert({
      where: { id: PROJECT_ID },
      update: {},
      create: {
        id: PROJECT_ID,
        title: "Application de gestion des soutenances",
        domain: "GENIE_LOGICIEL",
        academicYear: "2025/2026",
        teamType: "pair",
        supervisorId: teacherIds[0],
      },
    });

    const students = [
      {
        email: "yasmine.demo@demo.local",
        firstName: "Yasmine",
        lastName: "Demo",
        matricule: "20250001",
      },
      {
        email: "amine.demo@demo.local",
        firstName: "Amine",
        lastName: "Demo",
        matricule: "20250002",
      },
    ];
    for (const s of students) {
      await prisma.user.upsert({
        where: { email: s.email },
        update: {},
        create: {
          email: s.email,
          firstName: s.firstName,
          lastName: s.lastName,
          role: Role.STUDENT,
          passwordHash: demoHash,
          student: {
            create: {
              matricule: s.matricule,
              speciality: "GENIE_LOGICIEL",
              cursus: "INGENIEUR",
              accountStatus: "ACTIVE",
              projectId: PROJECT_ID,
            },
          },
        },
      });
    }
  }

  console.log(`Admin prêt : ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
