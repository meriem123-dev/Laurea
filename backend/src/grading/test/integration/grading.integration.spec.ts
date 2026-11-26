import { Test } from '@nestjs/testing';
import {
  CanActivate,
  ExecutionContext,
  INestApplication,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import request from 'supertest';
import { AppModule } from '../../../app.module';

// Remplace uniquement la vérification du token : l'identité vient des en-têtes
class FakeJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    req.user = {
      id: req.headers['x-user-id'] ?? 'inconnu',
      role: req.headers['x-user-role'],
    };
    return true;
  }
}

describe('Grading & Results API (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(new FakeJwtGuard())
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const as = (role: string, id = 'user-test') => ({
    'x-user-role': role,
    'x-user-id': id,
  });

  it('GET /health/ready répond 200 (app + base connectées)', async () => {
    await request(app.getHttpServer()).get('/health/ready').expect(200);
  });

  describe('GET /results', () => {
    it('l’administration reçoit une liste', async () => {
      const res = await request(app.getHttpServer())
        .get('/results')
        .set(as('ADMIN_STAFF'))
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('un étudiant n’y a pas accès', async () => {
      await request(app.getHttpServer())
        .get('/results')
        .set(as('STUDENT'))
        .expect(403);
    });
  });

  describe('GET /results/me', () => {
    it('un utilisateur sans dossier étudiant ne voit aucun résultat', async () => {
      const res = await request(app.getHttpServer())
        .get('/results/me')
        .set(as('STUDENT', 'sans-dossier'))
        .expect(200);
      expect(res.body).toEqual({ published: false, hasDefense: false });
    });

    it('l’administration n’y a pas accès', async () => {
      await request(app.getHttpServer())
        .get('/results/me')
        .set(as('ADMIN_STAFF'))
        .expect(403);
    });
  });

  describe('/defenses/:id/evaluation', () => {
    it('404 si la soutenance n’existe pas', async () => {
      await request(app.getHttpServer())
        .get('/defenses/999999/evaluation')
        .set(as('ADMIN_STAFF'))
        .expect(404);
    });

    it('400 si l’id n’est pas un nombre', async () => {
      await request(app.getHttpServer())
        .get('/defenses/abc/evaluation')
        .set(as('ADMIN_STAFF'))
        .expect(400);
    });

    it('un étudiant ne peut pas publier', async () => {
      await request(app.getHttpServer())
        .post('/defenses/1/evaluation/publish')
        .set(as('STUDENT'))
        .expect(403);
    });

    it('un enseignant ne peut pas publier', async () => {
      await request(app.getHttpServer())
        .post('/defenses/1/evaluation/publish')
        .set(as('TEACHER'))
        .expect(403);
    });

    it('un administrateur ne peut pas saisir de notes', async () => {
      await request(app.getHttpServer())
        .put('/defenses/1/evaluation/me')
        .set(as('ADMIN_STAFF'))
        .send({ scores: [] })
        .expect(403);
    });
  });
});