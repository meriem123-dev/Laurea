import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);

    if (
      !user ||
      !user.isActive ||
      !(await argon2.verify(user.passwordHash, password))
    ) {
      throw new UnauthorizedException("Identifiants invalides");
    }

    const payload={sub :user.id,role:user.role};

    return{
        accessToken :await this.jwt.signAsync(payload),
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
    }
  }
}
