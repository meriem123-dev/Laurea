import { juryAverage, weightedGrade } from '../../grading.utils';

const criteria = [
  { id: 'c1', coefficient: 1 },
  { id: 'c2', coefficient: 3 },
];

describe('weightedGrade (unit)', () => {
  it('calcule la moyenne pondérée', () => {
    // (10*1 + 18*3) / 4 = 16
    expect(weightedGrade({ c1: 10, c2: 18 }, criteria)).toBe(16);
  });

  it('arrondit à 2 décimales', () => {
    expect(weightedGrade({ c1: 10, c2: 11 }, criteria)).toBe(10.75);
    expect(weightedGrade({ c1: 10, c2: 10.333 }, criteria)).toBe(10.25);
  });

  it('retourne null si un critère n’est pas noté', () => {
    expect(weightedGrade({ c1: 10 }, criteria)).toBeNull();
  });

  it('retourne null sans critères', () => {
    expect(weightedGrade({ c1: 10 }, [])).toBeNull();
  });

  it('accepte une note de 0 (pas considérée comme manquante)', () => {
    expect(weightedGrade({ c1: 0, c2: 0 }, criteria)).toBe(0);
  });
});

describe('juryAverage (unit)', () => {
  it('calcule la moyenne des notes des jurés', () => {
    expect(juryAverage([10, 14, 18])).toBe(14);
  });

  it('retourne null si un juré n’a pas fini', () => {
    expect(juryAverage([10, null, 18])).toBeNull();
  });

  it('retourne null sans jurés', () => {
    expect(juryAverage([])).toBeNull();
  });
});