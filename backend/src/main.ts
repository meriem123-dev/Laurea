import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // /health reste à la racine (sondes Render / CD), le reste est sous /api
  app.setGlobalPrefix('api', { exclude: ['health', 'health/ready'] });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Front (Vercel) et API (Render) sont sur des origines différentes
  const origins = (process.env.FRONTEND_URL ?? 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim());
  app.enableCors({ origin: origins });

  app.enableShutdownHooks();

  // 0.0.0.0 indispensable dans un conteneur
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

bootstrap();