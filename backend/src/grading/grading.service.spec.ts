import { BadRequestException } from '@nestjs/common';
import { GradingService } from './grading.service';

describe('GradingService', () => {
  const service = new GradingService();

  describe('computeMemberGrade', () => {
    it('calcule la moyenne pondérée ramenée sur 20', () => {
      // (15/20)*3 + (10/20)*1 = 2.75 ; poids total 4 → 0.6875 * 20 = 13.75
      expect(
        service.computeMemberGrade([
          { weight: 3, maxScore: 20, value: 15 },
          { weight: 1, maxScore: 20, value: 10 },
        ]),
      ).toBe(13.75);
    });

    it('gère des critères avec des barèmes différents', () => {
      expect(
        service.computeMemberGrade([
          { weight: 1, maxScore: 10, value: 8 },
          { weight: 1, maxScore: 20, value: 15 },
        ]),
      ).toBe(15.5);
    });

    it('permet de changer de barème (ex. /100)', () => {
      expect(service.computeMemberGrade([{ weight: 1, maxScore: 20, value: 10 }], 100)).toBe(50);
    });

    it('refuse une note hors barème', () => {
      expect(() =>
        service.computeMemberGrade([{ weight: 1, maxScore: 20, value: 21 }]),
      ).toThrow(BadRequestException);
      expect(() =>
        service.computeMemberGrade([{ weight: 1, maxScore: 20, value: -1 }]),
      ).toThrow(BadRequestException);
    });

    it('refuse une pondération nulle ou une liste vide', () => {
      expect(() =>
        service.computeMemberGrade([{ weight: 0, maxScore: 20, value: 10 }]),
      ).toThrow(BadRequestException);
      expect(() => service.computeMemberGrade([])).toThrow(BadRequestException);
    });
  });

  describe('computeFinalGrade', () => {
    it('fait la moyenne des notes des membres, arrondie à 2 décimales', () => {
      expect(service.computeFinalGrade([14, 15, 13.5])).toBe(14.17);
    });
    it('refuse une liste vide', () => {
      expect(() => service.computeFinalGrade([])).toThrow(BadRequestException);
    });
  });

  describe('isPassed', () => {
    it('utilise 10 comme note de passage par défaut', () => {
      expect(service.isPassed(10)).toBe(true);
      expect(service.isPassed(9.99)).toBe(false);
    });
    it('accepte une note de passage paramétrable par cursus', () => {
      expect(service.isPassed(11, 12)).toBe(false);
      expect(service.isPassed(12, 12)).toBe(true);
    });
  });
});