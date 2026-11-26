import { Test } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { GradingService } from '../../grading.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotificationsService } from '../../../notifications/notifications.service';
import { Role } from '../../../generated/prisma/client';

const criteria = [
  { id: 'c1', label: 'A', description: '', coefficient: 1, position: 1 },
  { id: 'c2', label: 'B', description: '', coefficient: 3, position: 2 },
];

const user = (firstName: string) => ({ firstName, lastName: 'Test' });

// Soutenance fictive : président t1, membre t2, encadrant t3
function makeDefense(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    projectId: 10,
    presidentId: 't1',
    date: new Date('2026-06-01'),
    time: '09:00',
    duration: 30,
    president: { id: 't1', title: 'Dr', user: user('Alice') },
    members: [
      { teacherId: 't2', teacher: { id: 't2', title: 'Pr', user: user('Bob') } },
    ],
    project: {
      id: 10,
      title: 'Projet X',
      domain: 'IA',
      academicYear: '2025-2026',
      status: 'defended',
      supervisorId: 't3',
      coSupervisorId: null,
      students: [
        {
          id: 's1',
          cursus: 'MASTER',
          matricule: 'M001',
          speciality: 'SI',
          user: user('Eve'),
        },
      ],
    },
    room: { name: 'R1', block: 'A', pole: 'P1' },
    evaluation: null,
    scores: [],
    ...overrides,
  };
}

// Les deux jurés ont rempli toute la grille avec la même note
const fullScores = (value: number) =>
  ['t1', 't2'].flatMap((teacherId) =>
    ['c1', 'c2'].map((criterionId) => ({ teacherId, criterionId, value })),
  );

describe('GradingService (unit)', () => {
  let service: GradingService;

  const prismaMock = {
    criterion: { findMany: jest.fn(), upsert: jest.fn() },
    teacher: { findUnique: jest.fn() },
    student: { findUnique: jest.fn() },
    defense: { findUnique: jest.fn(), findMany: jest.fn() },
    defenseScore: { upsert: jest.fn(), deleteMany: jest.fn() },
    defenseEvaluation: { upsert: jest.fn(), update: jest.fn() },
    project: { update: jest.fn() },
    $transaction: jest.fn(),
  };

  const notificationsMock = {
    notifyAdmins: jest.fn(),
    notifyProjectStudents: jest.fn(),
    notifyTeachers: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        GradingService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: NotificationsService, useValue: notificationsMock },
      ],
    }).compile();
    service = moduleRef.get(GradingService);

    prismaMock.criterion.findMany.mockResolvedValue(criteria);
    prismaMock.$transaction.mockResolvedValue([]);
  });

  const asTeacher = (id: string) =>
    prismaMock.teacher.findUnique.mockResolvedValue({ id });
  const withDefense = (overrides: Record<string, unknown> = {}) =>
    prismaMock.defense.findUnique.mockResolvedValue(makeDefense(overrides));

  describe('listCriteria', () => {
    it('retourne les critères sans le champ position', async () => {
      const result = await service.listCriteria();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'c1',
        key: undefined,
        label: 'A',
        description: '',
        coefficient: 1,
      });
    });
  });

  describe('getEvaluation', () => {
    it('lève NotFound si la soutenance n’existe pas', async () => {
      prismaMock.defense.findUnique.mockResolvedValue(null);
      await expect(
        service.getEvaluation(99, { id: 'u1', role: Role.ADMIN_STAFF }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('refuse un enseignant ni juré ni encadrant', async () => {
      withDefense();
      asTeacher('t9');
      await expect(
        service.getEvaluation(1, { id: 'u9', role: Role.TEACHER }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('autorise un encadrant et marque isSupervisor', async () => {
      withDefense();
      asTeacher('t3');
      const view = await service.getEvaluation(1, {
        id: 'u3',
        role: Role.TEACHER,
      });
      expect(view.me.isSupervisor).toBe(true);
      expect(view.me.isJuror).toBe(false);
    });

    it('autorise le personnel administratif sans compte enseignant', async () => {
      withDefense();
      prismaMock.teacher.findUnique.mockResolvedValue(null);
      const view = await service.getEvaluation(1, {
        id: 'admin',
        role: Role.ADMIN_STAFF,
      });
      expect(view.me.teacherId).toBeNull();
    });

    it('calcule la moyenne et l’heure de fin quand toutes les grilles sont remplies', async () => {
      withDefense({ scores: fullScores(10) });
      asTeacher('t1');
      const view = await service.getEvaluation(1, {
        id: 'u1',
        role: Role.TEACHER,
      });
      expect(view.average).toBe(10);
      expect(view.finalGrade).toBe(10);
      expect(view.adjusted).toBe(false);
     expect(view.defense.endTime).toBe('09:30');
      expect(view.me.isPresident).toBe(true);
    });

    it('average est null si un juré n’a rien saisi', async () => {
      withDefense({
        scores: [
          { teacherId: 't1', criterionId: 'c1', value: 10 },
          { teacherId: 't1', criterionId: 'c2', value: 10 },
        ],
      });
      asTeacher('t1');
      const view = await service.getEvaluation(1, {
        id: 'u1',
        role: Role.TEACHER,
      });
      expect(view.average).toBeNull();
    });
  });

  describe('saveMyScores', () => {
    const dto = { scores: [{ criterionId: 'c1', value: 12 }] } as any;

    it('refuse un enseignant qui n’est pas dans le jury', async () => {
      withDefense();
      asTeacher('t9');
      await expect(service.saveMyScores(1, 'u9', dto)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('refuse la saisie si la note est verrouillée', async () => {
      withDefense({ evaluation: { locked: true } });
      asTeacher('t2');
      await expect(service.saveMyScores(1, 'u2', dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('refuse un critère inconnu', async () => {
      withDefense();
      asTeacher('t2');
      await expect(
        service.saveMyScores(1, 'u2', {
          scores: [{ criterionId: 'inconnu', value: 5 }],
        } as any),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('enregistre les notes dans une transaction (upsert ou suppression)', async () => {
      withDefense();
      asTeacher('t2');
      await service.saveMyScores(1, 'u2', {
        scores: [
          { criterionId: 'c1', value: 12 },
          { criterionId: 'c2', value: null },
        ],
      } as any);

      expect(prismaMock.defenseScore.upsert).toHaveBeenCalledTimes(1);
      expect(prismaMock.defenseScore.deleteMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateDeliberation', () => {
    it('refuse un membre du jury qui n’est pas président', async () => {
      withDefense();
      asTeacher('t2');
      await expect(
        service.updateDeliberation(1, 'u2', { finalGrade: 15 } as any),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('refuse si la note est verrouillée', async () => {
      withDefense({ evaluation: { locked: true } });
      asTeacher('t1');
      await expect(
        service.updateDeliberation(1, 'u1', { finalGrade: 15 } as any),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('n’écrit que les champs fournis', async () => {
      withDefense();
      asTeacher('t1');
      await service.updateDeliberation(1, 'u1', { finalGrade: 15 } as any);
      expect(prismaMock.defenseEvaluation.upsert).toHaveBeenCalledWith({
        where: { defenseId: 1 },
        create: { defenseId: 1, finalGrade: 15 },
        update: { finalGrade: 15 },
      });
    });
  });

  describe('lock', () => {
    it('refuse un non-président', async () => {
      withDefense({ scores: fullScores(10) });
      asTeacher('t2');
      await expect(service.lock(1, 'u2')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('refuse si déjà verrouillée', async () => {
      withDefense({ evaluation: { locked: true } });
      asTeacher('t1');
      await expect(service.lock(1, 'u1')).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('refuse si une grille est incomplète', async () => {
      withDefense({ scores: [] });
      asTeacher('t1');
      await expect(service.lock(1, 'u1')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('refuse un ajustement de note sans justification', async () => {
      withDefense({
        scores: fullScores(10),
        evaluation: { finalGrade: 18, justification: '  ', locked: false },
      });
      asTeacher('t1');
      await expect(service.lock(1, 'u1')).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it('verrouille avec la moyenne, passe le projet en "graded" et notifie l’administration', async () => {
      withDefense({ scores: fullScores(10) });
      asTeacher('t1');

      await service.lock(1, 'u1');

      expect(prismaMock.defenseEvaluation.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            finalGrade: 10,
            locked: true,
            lockedById: 't1',
          }),
        }),
      );
      expect(prismaMock.project.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: { status: 'graded' },
      });
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
      expect(notificationsMock.notifyAdmins).toHaveBeenCalledTimes(1);
    });

    it('accepte un ajustement justifié', async () => {
      withDefense({
        scores: fullScores(10),
        evaluation: {
          finalGrade: 12,
          justification: 'Qualité de la soutenance',
          locked: false,
        },
      });
      asTeacher('t1');
      await service.lock(1, 'u1');
      expect(prismaMock.defenseEvaluation.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({ finalGrade: 12 }),
        }),
      );
    });
  });

  describe('setPublished', () => {
    const admin = { id: 'admin', role: Role.ADMIN_STAFF };

    it('refuse de publier une note non verrouillée', async () => {
      withDefense({ evaluation: { locked: false } });
      await expect(
        service.setPublished(1, true, admin),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('à la première publication, notifie étudiants et enseignants', async () => {
      withDefense({ evaluation: { locked: true, publishedAt: null } });
      prismaMock.teacher.findUnique.mockResolvedValue(null);

      await service.setPublished(1, true, admin);

      expect(prismaMock.defenseEvaluation.update).toHaveBeenCalledWith({
        where: { defenseId: 1 },
        data: { publishedAt: expect.any(Date) },
      });
      expect(notificationsMock.notifyProjectStudents).toHaveBeenCalledWith(
        10,
        expect.objectContaining({ type: 'RESULT' }),
      );
      expect(notificationsMock.notifyTeachers).toHaveBeenCalledTimes(1);
    });

    it('ne renotifie pas si déjà publiée', async () => {
      withDefense({
        evaluation: { locked: true, publishedAt: new Date() },
      });
      prismaMock.teacher.findUnique.mockResolvedValue(null);

      await service.setPublished(1, true, admin);

      expect(notificationsMock.notifyProjectStudents).not.toHaveBeenCalled();
      expect(notificationsMock.notifyTeachers).not.toHaveBeenCalled();
    });

    it('dépublier remet publishedAt à null sans notifier', async () => {
      withDefense({
        evaluation: { locked: true, publishedAt: new Date() },
      });
      prismaMock.teacher.findUnique.mockResolvedValue(null);

      await service.setPublished(1, false, admin);

      expect(prismaMock.defenseEvaluation.update).toHaveBeenCalledWith({
        where: { defenseId: 1 },
        data: { publishedAt: null },
      });
      expect(notificationsMock.notifyProjectStudents).not.toHaveBeenCalled();
    });
  });

  describe('listResults', () => {
    it('calcule l’état pending / ready / published et masque la note tant que non verrouillée', async () => {
      prismaMock.defense.findMany.mockResolvedValue([
        makeDefense({ id: 1, evaluation: null }),
        makeDefense({
          id: 2,
          evaluation: { locked: true, finalGrade: 14, publishedAt: null },
        }),
        makeDefense({
          id: 3,
          evaluation: {
            locked: true,
            finalGrade: 16,
            publishedAt: new Date(),
          },
        }),
      ]);

      const rows = await service.listResults();

      expect(rows.map((r) => r.state)).toEqual([
        'pending',
        'ready',
        'published',
      ]);
      expect(rows[0].finalGrade).toBeNull();
      expect(rows[1].finalGrade).toBe(14);
      expect(rows[2].finalGrade).toBe(16);
    });
  });

  describe('getMyResult', () => {
    it('étudiant inexistant ou sans soutenance', async () => {
      prismaMock.student.findUnique.mockResolvedValue(null);
      expect(await service.getMyResult('u1')).toEqual({
        published: false,
        hasDefense: false,
      });

      prismaMock.student.findUnique.mockResolvedValue({
        id: 's1',
        project: { defense: null },
      });
      expect(await service.getMyResult('u1')).toEqual({
        published: false,
        hasDefense: false,
      });
    });

    it('ne révèle rien tant que la note n’est pas publiée', async () => {
      prismaMock.student.findUnique.mockResolvedValue({
        id: 's1',
        project: { defense: { id: 1 } },
      });
      prismaMock.defense.findMany.mockResolvedValue([
        makeDefense({
          evaluation: { locked: true, finalGrade: 15, publishedAt: null },
        }),
      ]);
      expect(await service.getMyResult('u1')).toEqual({
        published: false,
        hasDefense: true,
      });
    });

    it('retourne la note et les critères une fois publiée', async () => {
      prismaMock.student.findUnique.mockResolvedValue({
        id: 's1',
        project: { defense: { id: 1 } },
      });
      prismaMock.defense.findMany.mockResolvedValue([
        makeDefense({
          evaluation: {
            locked: true,
            finalGrade: 15,
            publishedAt: new Date(),
          },
        }),
      ]);

      const result: any = await service.getMyResult('u1');

      expect(result.published).toBe(true);
      expect(result.studentId).toBe('s1');
      expect(result.row.finalGrade).toBe(15);
      expect(result.row.state).toBe('published');
      expect(result.criteria).toHaveLength(2);
    });
  });
});