import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test', quiet: true, override: true });

const url = process.env.DATABASE_URL;
if (!url || !/(test|_ci)/.test(url)) {
  throw new Error(
    'DATABASE_URL absente ou ne ressemble pas à une base de test (test ou _ci) : arrêt pour protéger les autres bases.',
  );
}

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET ??= 'test-secret';
process.env.FRONTEND_URL ??= 'http://localhost:5173';
process.env.ADMIN_EMAIL ??= 'admin-test@example.com';
process.env.ADMIN_PASSWORD ??= 'test-password-123';
process.env.MAILJET_API_KEY ??= 'test';
process.env.MAILJET_SECRET_KEY ??= 'test';
process.env.MAIL_FROM ??= 'test@example.com';