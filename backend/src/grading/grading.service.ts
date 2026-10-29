import { BadRequestException, Injectable } from '@nestjs/common';

export interface CriterionScore {
  weight: number; 
  maxScore: number; 
  value: number;   
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Calcul de la note finale, sans base de données, testé en CI. */
@Injectable()
export class GradingService {

  computeMemberGrade(scores: CriterionScore[], scale = 20): number {
    if (scores.length === 0) {
      throw new BadRequestException('Aucun critère noté.');
    }
    let weighted = 0;
    let totalWeight = 0;
    for (const s of scores) {
      if (s.weight <= 0 || s.maxScore <= 0) {
        throw new BadRequestException('Pondération et barème doivent être positifs.');
      }
      if (s.value < 0 || s.value > s.maxScore) {
        throw new BadRequestException(`Note ${s.value} hors barème (0 – ${s.maxScore}).`);
      }
      weighted += (s.value / s.maxScore) * s.weight;
      totalWeight += s.weight;
    }
    return round2((weighted / totalWeight) * scale);
  }

  /** Note finale : moyenne des notes des membres du jury. */
  computeFinalGrade(memberGrades: number[]): number {
    if (memberGrades.length === 0) {
      throw new BadRequestException('Aucune note de jury saisie.');
    }
    const sum = memberGrades.reduce((a, b) => a + b, 0);
    return round2(sum / memberGrades.length);
  }

  isPassed(finalGrade: number, passMark = 10): boolean {
    return finalGrade >= passMark;
  }
}