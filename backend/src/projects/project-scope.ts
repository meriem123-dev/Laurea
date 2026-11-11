import { Prisma, Role } from "../generated/prisma/client";

export interface AuthUser {
  id: string; // id du User (req.user.id)
  role: Role;
}

// Filtre Prisma : les projets accessibles à cet utilisateur
// - étudiant : le projet dont il est membre
// - enseignant : les projets qu'il encadre ou co-encadre
// - admin : tous
export function projectScope(user: AuthUser): Prisma.ProjectWhereInput {
  switch (user.role) {
    case Role.STUDENT:
      return { students: { some: { userId: user.id } } };
    case Role.TEACHER:
      return {
        OR: [
          { supervisor: { userId: user.id } },
          { coSupervisor: { userId: user.id } },
        ],
      };
    default:
      return {};
  }
}