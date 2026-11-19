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
- Neon pour la base de données de production

## Architecture du projet

```text
Laurea/
├── .github/
│   └── workflows/          # Workflows GitHub Actions
├── backend/                # API NestJS
├── frontend/               # Application Vue.js
├── docker-compose.yml      # Environnement local
├── render.yaml             # Configuration Render
├── .nvmrc                  # Version Node.js
└── README.md
```

## Installation et lancement en local

### Prérequis

- Git
- Node.js (version indiquée dans `.nvmrc`)
- npm
- Docker Desktop

Aucune installation locale de PostgreSQL n'est nécessaire : la base de données est lancée dans un conteneur Docker.

### 1. Cloner le dépôt

```bash
git clone https://github.com/meriem123-dev/Laurea.git
cd Laurea
```

### 2. Configurer le backend

 configurer le fichier `backend/.env`.

La connexion à PostgreSQL est configurée automatiquement par Docker Compose pour l'environnement local.

### 3. Démarrer le backend et la base de données

Depuis la racine du projet :

```bash
docker compose up -d --build
```

Docker Compose démarre les services dans l'ordre suivant :

1. **db :** démarre PostgreSQL 17 et attend qu'il soit prêt.
2. **migrate :** applique automatiquement les migrations Prisma, puis s'arrête.
3. **api :** démarre le serveur NestJS après la réussite des migrations.

L'API est accessible à l'adresse :

```text
http://localhost:3000
```

Pour consulter l'état des conteneurs :

```bash
docker compose ps
```

Pour consulter les logs :

```bash
docker compose logs -f api
```

Pour consulter les logs de la base de données :

```bash
docker compose logs -f db
```

### 4. Démarrer le frontend

Dans un autre terminal :

```bash
cd frontend
npm install
npm run dev
```

Le frontend est accessible à l'adresse :

```text
http://localhost:5173
```


### 5. Arrêter les services

Depuis la racine du projet :

```bash
docker compose down
```

Cette commande arrête et supprime les conteneurs sans supprimer les données persistées dans les volumes Docker.

Pour supprimer également les données locales de PostgreSQL :

```bash
docker compose down -v
```

**Attention :** cette dernière commande supprime les données de la base locale.

## Tests et intégration continue

Le projet utilise GitHub Actions pour automatiser plusieurs vérifications.

La CI comprend notamment :

- Validation du schéma Prisma.
- Application et vérification des migrations.
- Analyse statique du code.
- Exécution des tests.
- Vérification du build frontend et backend.
- Vérification de la configuration Docker.
- Audit des dépendances.

La stratégie de tests distingue trois niveaux :

- **Tests unitaires :** vérification des fonctions et composants isolés.
- **Tests d'intégration :** vérification des interactions entre plusieurs composants.
- **Tests End-to-End (E2E) :** vérification des parcours complets à travers l'application.

## Déploiement

Les environnements de production utilisent :

- **Vercel :** hébergement du frontend.
- **Render :** hébergement de l'API backend.
- **Neon :** hébergement de la base de données PostgreSQL.

Application : https://laurea-gold.vercel.app/

## Équipe

Projet réalisé dans le cadre d'un travail universitaire en équipe de quatre membres.

**Équipe : ThunDevs**

---

*Laurea est actuellement en cours de développement. Les fonctionnalités, l'architecture et la documentation sont susceptibles d'évoluer au fil des contributions.*
