import type { Criterion, CriterionScores, DefenseEvaluation } from '../types/evaluation'

// Données fictives : à remplacer par les appels API.
// TODO : la grille dépend du cursus (Master / Ingénieur) et de l'établissement.
export const CRITERIA: Criterion[] = [
  {
    id: 'scientific',
    label: 'Démarche scientifique',
    description: 'Problématique, méthode et rigueur',
    coefficient: 3,
  },
  {
    id: 'results',
    label: 'Qualité des résultats',
    description: 'Analyses pertinentes et contribution',
    coefficient: 3,
  },
  {
    id: 'report',
    label: 'Qualité du mémoire',
    description: 'Structure, rédaction et bibliographie',
    coefficient: 2,
  },
  {
    id: 'oral',
    label: 'Présentation orale',
    description: 'Clarté de la synthèse et gestion du temps',
    coefficient: 1,
  },
  {
    id: 'questions',
    label: 'Réponses aux questions',
    description: 'Maîtrise du sujet et argumentation',
    coefficient: 1,
  },
]

// grid(16, 15) renseigne les deux premiers critères seulement (grille incomplète)
function grid(...values: number[]): CriterionScores {
  const scores: CriterionScores = {}
  values.forEach((value, index) => {
    const criterion = CRITERIA[index]
    if (criterion) scores[criterion.id] = value
  })
  return scores
}

// defenseId et les clés de `scores` renvoient à mocks/defenses.ts et mocks/professors.ts
export const evaluations: DefenseEvaluation[] = [
  {
    defenseId: 1,
    scores: {
      2: grid(16, 16, 17, 18, 18),
      5: grid(17, 17, 16, 17, 17),
      6: grid(17, 17, 16, 17, 17),
      7: grid(17, 16, 17, 17, 18),
    },
    finalGrade: 16.75,
    justification: '',
    observations: 'Très bon travail, résultats pertinents.',
    locked: true,
  },
  {
    defenseId: 2,
    scores: {
      2: grid(15, 14, 15, 15, 14),
      1: grid(15, 14), // le professeur connecté n'a pas fini : colonne modifiable
      5: grid(14, 15, 14, 14, 15),
      8: grid(15, 15, 14, 15, 15),
    },
    finalGrade: null,
    justification: '',
    observations: '',
    locked: false,
  },
  {
    defenseId: 3,
    scores: {
      2: grid(14, 15, 14, 15, 16),
      5: grid(15, 15, 15),
    },
    finalGrade: null,
    justification: '',
    observations: '',
    locked: false,
  },
  {
    defenseId: 4,
    scores: {
      7: grid(13, 13, 14, 14, 13),
      2: grid(13, 14, 13, 13, 14),
      5: grid(14, 13, 13, 14, 14),
    },
    finalGrade: null,
    justification: '',
    observations: '',
    locked: false,
  },
]