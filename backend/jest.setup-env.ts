import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test', quiet: true });

const url = process.env.DATABASE_URL;
if (url && !/(test|_ci)/.test(url)) {
  throw new Error(
    'DATABASE_URL ne ressemble pas à une base de test (test ou _ci) : arrêt pour protéger les autres bases.',
  );
}

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET ??= 'test-secret';