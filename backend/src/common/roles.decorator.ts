import { SetMetadata } from '@nestjs/common';
import { Role } from '../generated/prisma/client';

//créer mon décorateur pour afffecter des roles
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);