import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../app.module';

describe('Accès aux résultats et notes (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const routes: [string, string][] = [
    ['get', '/results'],
    ['get', '/results/me'],
    ['get', '/defenses/1/evaluation'],
    ['put', '/defenses/1/evaluation/me'],
    ['patch', '/defenses/1/evaluation/deliberation'],
    ['post', '/defenses/1/evaluation/lock'],
    ['post', '/defenses/1/evaluation/publish'],
    ['post', '/defenses/1/evaluation/unpublish'],
  ];

  it.each(routes)(
    '%s %s refuse une requête sans token (401)',
    async (method, url) => {
      await (request(app.getHttpServer()) as any)[method](url).expect(401);
    },
  );

  it('refuse un token invalide (401)', async () => {
    await request(app.getHttpServer())
      .get('/results')
      .set('Authorization', 'Bearer token-invalide')
      .expect(401);
  });

  it.todo(
    'login enseignant → saisie des notes → verrouillage → publication → l’étudiant consulte son résultat',
  );
});