import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpsertMyScoresDto } from '../../dto/upsert-my-scores.dto';
import { UpdateDeliberationDto } from '../../dto/update-deliberation.dto';

// Même mécanique que le ValidationPipe de Nest : objet brut -> instance -> validation
async function errorsFor<T extends object>(
  cls: new () => T,
  payload: unknown,
): Promise<string[]> {
  const instance = plainToInstance(cls, payload as object);
  const errors = await validate(instance);
  return errors.map((e) => e.property);
}

describe('UpsertMyScoresDto (unit)', () => {
  it('accepte des notes valides', async () => {
    const errors = await errorsFor(UpsertMyScoresDto, {
      scores: [
        { criterionId: 'c1', value: 12.5 },
        { criterionId: 'c2', value: 0 },
        { criterionId: 'c3', value: 20 },
      ],
    });
    expect(errors).toEqual([]);
  });

  it('accepte value = null (suppression de la note)', async () => {
    const errors = await errorsFor(UpsertMyScoresDto, {
      scores: [{ criterionId: 'c1', value: null }],
    });
    expect(errors).toEqual([]);
  });

  it('refuse un tableau vide', async () => {
    expect(await errorsFor(UpsertMyScoresDto, { scores: [] })).toContain(
      'scores',
    );
  });

  it('refuse l’absence de scores', async () => {
    expect(await errorsFor(UpsertMyScoresDto, {})).toContain('scores');
  });

  it('refuse une note supérieure à 20', async () => {
    expect(
      await errorsFor(UpsertMyScoresDto, {
        scores: [{ criterionId: 'c1', value: 21 }],
      }),
    ).toContain('scores');
  });

  it('refuse une note négative', async () => {
    expect(
      await errorsFor(UpsertMyScoresDto, {
        scores: [{ criterionId: 'c1', value: -1 }],
      }),
    ).toContain('scores');
  });

  it('refuse une note qui n’est pas un nombre', async () => {
    expect(
      await errorsFor(UpsertMyScoresDto, {
        scores: [{ criterionId: 'c1', value: 'quinze' }],
      }),
    ).toContain('scores');
  });

  it('refuse un criterionId qui n’est pas une chaîne', async () => {
    expect(
      await errorsFor(UpsertMyScoresDto, {
        scores: [{ criterionId: 123, value: 10 }],
      }),
    ).toContain('scores');
  });
});

describe('UpdateDeliberationDto (unit)', () => {
  it('accepte un objet vide (tout est optionnel)', async () => {
    expect(await errorsFor(UpdateDeliberationDto, {})).toEqual([]);
  });

  it('accepte une note finale valide, 0 et 20 inclus', async () => {
    for (const finalGrade of [0, 14.5, 20]) {
      expect(await errorsFor(UpdateDeliberationDto, { finalGrade })).toEqual(
        [],
      );
    }
  });

  it('accepte finalGrade = null (retour à la moyenne du jury)', async () => {
    expect(
      await errorsFor(UpdateDeliberationDto, { finalGrade: null }),
    ).toEqual([]);
  });

  it('refuse une note finale hors de 0 à 20', async () => {
    for (const finalGrade of [-0.5, 20.5, 100]) {
      expect(
        await errorsFor(UpdateDeliberationDto, { finalGrade }),
      ).toContain('finalGrade');
    }
  });

  it('refuse une note finale qui n’est pas un nombre', async () => {
    expect(
      await errorsFor(UpdateDeliberationDto, { finalGrade: 'abc' }),
    ).toContain('finalGrade');
  });

  it('accepte une justification de 2000 caractères et refuse 2001', async () => {
    expect(
      await errorsFor(UpdateDeliberationDto, {
        justification: 'a'.repeat(2000),
      }),
    ).toEqual([]);
    expect(
      await errorsFor(UpdateDeliberationDto, {
        justification: 'a'.repeat(2001),
      }),
    ).toContain('justification');
  });

  it('accepte des observations de 4000 caractères et refuse 4001', async () => {
    expect(
      await errorsFor(UpdateDeliberationDto, {
        observations: 'a'.repeat(4000),
      }),
    ).toEqual([]);
    expect(
      await errorsFor(UpdateDeliberationDto, {
        observations: 'a'.repeat(4001),
      }),
    ).toContain('observations');
  });

  it('refuse une justification qui n’est pas une chaîne', async () => {
    expect(
      await errorsFor(UpdateDeliberationDto, { justification: 42 }),
    ).toContain('justification');
  });
});