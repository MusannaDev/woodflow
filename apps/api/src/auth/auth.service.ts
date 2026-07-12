import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthPayload, LoginInput } from './dto/auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(input: LoginInput): Promise<AuthPayload> {
    const user = await this.prisma.raw.user.findUnique({
      where: { phone: input.phone },
      include: { memberships: { include: { workspace: true } } },
    });
    if (!user) {
      throw new UnauthorizedException('Telefon yoki parol noto‘g‘ri.');
    }

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Telefon yoki parol noto‘g‘ri.');
    }

    const token = await this.jwt.signAsync({ sub: user.id, phone: user.phone });

    return {
      token,
      userId: user.id,
      name: user.name,
      workspaces: user.memberships.map((m) => ({
        id: m.workspace.id,
        name: m.workspace.name,
        type: m.workspace.type,
        role: m.role,
      })),
    };
  }

  /** Parolni hash qilish — seed va foydalanuvchi yaratishda ishlatiladi. */
  static hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
  }
}
