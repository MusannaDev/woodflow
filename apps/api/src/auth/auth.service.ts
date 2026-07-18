import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthPayload, LoginInput, RegisterInput } from './dto/auth.types';

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

  /**
   * Ro'yxatdan o'tish: yangi foydalanuvchi + ikkita workspace
   * ("Yog'och sotuvi" va "Taxta sotuvi") + OWNER a'zoliklar — atomik.
   */
  async register(input: RegisterInput): Promise<AuthPayload> {
    const exists = await this.prisma.raw.user.findUnique({
      where: { phone: input.phone },
    });
    if (exists) {
      throw new ConflictException(
        'Bu telefon raqam allaqachon ro‘yxatdan o‘tgan.',
      );
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const { user, workspaces } = await this.prisma.raw.$transaction(
      async (tx) => {
        const u = await tx.user.create({
          data: { name: input.name, phone: input.phone, passwordHash },
        });
        const wood = await tx.workspace.create({
          data: { name: 'Yog‘och sotuvi', type: 'WOOD_TRADING' },
        });
        const lumber = await tx.workspace.create({
          data: { name: 'Taxta sotuvi', type: 'LUMBER_PRODUCTION' },
        });
        await tx.membership.createMany({
          data: [
            { userId: u.id, workspaceId: wood.id, role: 'OWNER' },
            { userId: u.id, workspaceId: lumber.id, role: 'OWNER' },
          ],
        });
        return { user: u, workspaces: [wood, lumber] };
      },
    );

    const token = await this.jwt.signAsync({ sub: user.id, phone: user.phone });

    return {
      token,
      userId: user.id,
      name: user.name,
      workspaces: workspaces.map((w) => ({
        id: w.id,
        name: w.name,
        type: w.type,
        role: 'OWNER',
      })),
    };
  }

  /** Parolni hash qilish — seed va foydalanuvchi yaratishda ishlatiladi. */
  static hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
  }
}
