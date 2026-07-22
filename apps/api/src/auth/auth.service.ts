import {
  BadRequestException,
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
    });
    if (!user) {
      throw new UnauthorizedException('Telefon yoki parol noto‘g‘ri.');
    }
    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Telefon yoki parol noto‘g‘ri.');
    }
    return this.buildPayload(user.id);
  }

  /**
   * Ro'yxatdan o'tish:
   *  OWNER  → user + Business(PENDING) + OWNER_SIGNUP so'rovi (CEO tasdiqlaydi).
   *           Workspace'lar FAQAT tasdiqdan keyin ochiladi.
   *  WORKER → user; telefon biror biznes ishchisiga mos kelsa WORKER_JOIN
   *           so'rovi (egasi tasdiqlaydi), aks holda kutish holati.
   */
  async register(input: RegisterInput): Promise<AuthPayload> {
    const exists = await this.prisma.raw.user.findUnique({
      where: { phone: input.phone },
    });
    if (exists) {
      throw new ConflictException('Bu telefon raqam allaqachon ro‘yxatdan o‘tgan.');
    }
    if (input.accountType === 'OWNER' && !input.businessName?.trim()) {
      throw new BadRequestException('Biznes nomini kiriting.');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await this.prisma.raw.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: { name: input.name, phone: input.phone, passwordHash },
      });

      if (input.accountType === 'OWNER') {
        const business = await tx.business.create({
          data: {
            name: input.businessName!.trim(),
            ownerId: u.id,
            status: 'PENDING',
            kind: input.businessKind ?? 'BOTH',
          },
        });
        await tx.joinRequest.create({
          data: { type: 'OWNER_SIGNUP', userId: u.id, businessId: business.id },
        });
      } else {
        // WORKER: telefon bo'yicha bog'lanmagan ishchi yozuvini qidiramiz
        const employee = await tx.employee.findFirst({
          where: { phone: input.phone, userId: null, businessId: { not: null } },
        });
        if (employee?.businessId) {
          await tx.joinRequest.create({
            data: {
              type: 'WORKER_JOIN',
              userId: u.id,
              businessId: employee.businessId,
              employeeId: employee.id,
            },
          });
        }
        // topilmasa — WAITING_EMPLOYEE holati (buildPayload hisoblaydi)
      }
      return u;
    });

    return this.buildPayload(user.id);
  }

  /** Login/registerdan keyin yagona payload: rollar, biznes, kutish holati. */
  async buildPayload(userId: string): Promise<AuthPayload> {
    const user = await this.prisma.raw.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        memberships: { include: { workspace: { include: { business: true } } } },
        ownedBusinesses: true,
        joinRequests: {
          where: { status: 'PENDING' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const token = await this.jwt.signAsync({ sub: user.id, phone: user.phone });

    // CEO — sof admin: biznes/makon ko'rinmaydi, faqat CEO panelni boshqaradi.
    if (user.platformRole === 'CEO') {
      return {
        token,
        userId: user.id,
        name: user.name,
        platformRole: 'CEO',
        workspaces: [],
        business: null,
        pending: null,
      };
    }

    // Biznes: egalik qilgani, bo'lmasa a'zoligi orqali
    const owned = user.ownedBusinesses[0] ?? null;
    const viaMembership =
      user.memberships[0]?.workspace.business ?? null;
    const business = owned ?? viaMembership;

    // Kutish holati
    let pending: string | null = null;
    if (user.memberships.length === 0) {
      const req = user.joinRequests[0];
      if (owned && owned.status === 'PENDING') pending = 'CEO_APPROVAL';
      else if (owned && owned.status === 'REJECTED') pending = 'REJECTED';
      else if (req?.type === 'WORKER_JOIN') pending = 'OWNER_APPROVAL';
      else if (!owned) pending = 'WAITING_EMPLOYEE';
    }

    // Platforma obunasi bloklanganmi (faqat ACTIVE biznes uchun)
    const blocked =
      !!business &&
      business.status === 'ACTIVE' &&
      !business.freeAccess &&
      (!business.paidUntil || business.paidUntil.getTime() < Date.now());

    return {
      token,
      userId: user.id,
      name: user.name,
      platformRole: user.platformRole,
      workspaces: user.memberships.map((m) => ({
        id: m.workspace.id,
        name: m.workspace.name,
        type: m.workspace.type,
        role: m.role,
      })),
      business: business
        ? {
            id: business.id,
            name: business.name,
            logoUrl: business.logoUrl,
            status: business.status,
            blocked,
            paidUntil: business.paidUntil,
            freeAccess: business.freeAccess,
          }
        : null,
      pending,
    };
  }

  static hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
  }
}
