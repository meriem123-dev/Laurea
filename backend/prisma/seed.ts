import 'dotenv/config';
import { PrismaClient, Role } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  // en minuscules, parce que findByEmail fait toLowerCase
  const email = process.env.ADMIN_EMAIL ?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if(!email||!password)
  {
    throw new Error("email et mot de passe obligatoires ! ")
  }

  await prisma.user.upsert({
    where: { email },
    update: {}, // si l'admin existe déjà, on touche à rien
    create: {
      email,
      passwordHash: await argon2.hash(password),
      firstName: 'Admin',
      lastName: 'Système',
      role: Role.ADMIN_STAFF,
    },
  });

  const roomsSeed = [
  { name: 'Salle A12', block: 'Bâtiment Sciences', pole: '', equipment: 'Vidéoprojecteur, tableau', capacity: 24, tone: 'blue' },
  { name: 'Amphi B', block: 'Bâtiment Central', pole: '', equipment: 'Vidéoconférence, sonorisation, micro', capacity: 120, tone: 'violet' },
  { name: 'Salle C04', block: '', pole: 'Pôle Numérique', equipment: 'Vidéoprojecteur, visioconférence', capacity: 32, tone: 'green' },
  { name: 'Salle A08', block: 'Bâtiment Sciences', pole: '', equipment: 'Tableau', capacity: 20, tone: 'orange' },
];

for (const room of roomsSeed) {
  await prisma.room.upsert({
    where: { name: room.name },
    update: {},
    create: room,
  });
}

  console.log(`Admin prêt : ${email}`);

}


main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());