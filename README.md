# Laurea – Plateforme de gestion des soutenances

Laurea est une application web destinée à faciliter la gestion et le suivi des soutenances de projets de fin d'études (Master et Ingénieur).

Le projet vise à centraliser les différentes étapes de l'organisation des soutenances, depuis leur planification jusqu'à la gestion des évaluations et la consultation des résultats.

> **Statut :** Projet en cours de développement.

## Objectifs du projet

- Centraliser les informations relatives aux soutenances.
- Faciliter la gestion des étudiants, enseignants et membres des jurys.
- Organiser et suivre la planification des soutenances.
- Permettre la saisie et la gestion des évaluations.
- Faciliter la consultation des résultats.
- Assurer une gestion des accès selon les rôles des utilisateurs.

## Fonctionnalités

Les fonctionnalités sont développées progressivement.

- **Authentification :** inscription, connexion et gestion des comptes.
- **Gestion des utilisateurs :** prise en charge des différents profils.
- **Gestion des soutenances :** organisation et suivi des soutenances.
- **Gestion des jurys :** affectation des enseignants et gestion des rôles.
- **Gestion des évaluations :** saisie et calcul des notes.
- **Gestion des résultats :** consultation et suivi des résultats.

## Technologies utilisées

### Frontend
- Vue.js 3
- TypeScript
- Vite
- Pinia
- Vue Router
- Lucide

### Backend
- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT pour l'authentification
- Argon2 pour le hachage des mots de passe

### DevOps et déploiement
- Docker et Docker Compose
- GitHub Actions
- CI/CD
- Render pour le backend
- Vercel pour le frontend

## Architecture du projet

```text
Laurea/
├── .github/
│   └── workflows/       # Workflows CI/CD
├── backend/             # API NestJS
├── frontend/            # Application Vue.js
├── docker-compose.yml   # Configuration Docker
├── render.yaml          # Configuration Render
├── .nvmrc               # Version Node.js
└── README.md
```

## Installation et lancement en local

### Prérequis

- Git
- Node.js (version indiquée dans `.nvmrc`)
- npm
- Docker Desktop
- PostgreSQL (ou environnement PostgreSQL via Docker)

### 1. Cloner le dépôt

```bash
git clone https://github.com/meriem123-dev/Laurea.git
cd Laurea
```

### 2. Configurer le backend

```bash
cd backend
npm install
```

Configurer les variables d'environnement nécessaires dans un fichier `.env`, notamment la connexion à PostgreSQL et les paramètres d'authentification.

Puis générer le client Prisma et appliquer les migrations :

```bash
npx prisma generate
npx prisma migrate deploy
```

Lancer le serveur en mode développement :

```bash
npm run start:dev
```

### 3. Configurer le frontend

Dans un autre terminal :

```bash
cd frontend
npm install
npm run dev
```

Les variables d'environnement du frontend doivent être configurées selon l'URL de l'API locale.

## Tests et intégration continue

Le projet utilise GitHub Actions pour automatiser les vérifications avant intégration.

La CI comprend notamment :

- Vérification et validation du schéma Prisma.
- Application et vérification des migrations.
- Analyse statique du code.
- Exécution des tests.
- Vérification du build frontend et backend.
- Vérification de la configuration Docker.
- Audit des dépendances.

La stratégie de tests prévoit trois niveaux :

- **Tests unitaires :** vérification des fonctions et composants isolés.
- **Tests d'intégration :** vérification des interactions entre plusieurs composants.
- **Tests End-to-End (E2E) :** vérification des parcours complets à travers l'application.

## Déploiement

Le projet utilise :
- **Render** pour héberger l'API backend.
- **Vercel** pour héberger l'application frontend.
- **Neon / PostgreSQL** pour la base de données distante.

Application : https://laurea-gold.vercel.app/

## Équipe

Projet réalisé dans le cadre d'un travail universitaire en équipe de quatre membres.

**Équipe : ThunDevs**

---

*Laurea est actuellement en développement. Les fonctionnalités, l'architecture et la documentation sont susceptibles d'évoluer au fil des contributions.*