import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FtApiService } from '../ftapi/ftapi.service';
import { PrismaService } from '../prisma/prisma.service';

interface FtCampusUser {
  id: number;
  login: string;
  displayname?: string;
  image?: { link: string | null; versions?: { medium?: string | null } };
}

const PAGE_SIZE = 100;

@Injectable()
export class PoolService implements OnModuleInit {
  private readonly logger = new Logger(PoolService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ft: FtApiService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    if (this.config.get('POOL_SYNC_ON_BOOT') === 'false') return;

    void this.sync().catch((e: Error) =>
      this.logger.error(
        `sync impossible, la whitelist en base est conservée: ${e.message}`,
      ),
    );
  }

  currentPool() {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Paris',
      month: 'long',
      year: 'numeric',
    }).formatToParts(now);

    const month = parts.find((p) => p.type === 'month')!.value.toLowerCase();
    const year = Number(parts.find((p) => p.type === 'year')!.value);

    return {
      month: this.config.get<string>('FT_POOL_MONTH') ?? month,
      year: Number(this.config.get<string>('FT_POOL_YEAR') ?? year),
    };
  }

  private extraLogins() {
    return (this.config.get<string>('EXTRA_LOGINS') ?? '')
      .split(',')
      .map((l) => l.trim().toLowerCase())
      .filter(Boolean);
  }

  private identityOf(u: FtCampusUser) {
    return {
      ftId: String(u.id),
      displayName: u.displayname ?? null,
      ftPfpUrl: u.image?.versions?.medium ?? u.image?.link ?? null,
    };
  }

  private async syncStaff(logins: string[], now: Date) {
    for (const login of logins) {
      let identity: ReturnType<typeof this.identityOf> | null = null;
      try {
        identity = this.identityOf(
          await this.ft.get<FtCampusUser>(`/v2/users/${login}`),
        );
      } catch {
        this.logger.warn(`profil 42 introuvable pour ${login}`);
      }

      await this.prisma.swimmer.upsert({
        where: { login },
        update: { ...(identity ?? {}), staff: true, active: true, syncedAt: now },
        create: { login, ...(identity ?? {}), staff: true },
      });
    }

    return logins.length;
  }

  async sync() {
    const campusId = this.config.get<string>('FT_CAMPUS_ID') ?? '31';
    const { month, year } = this.currentPool();

    const found = new Map<string, FtCampusUser>();
    for (let page = 1; ; page++) {
      const batch = await this.ft.get<FtCampusUser[]>(
        `/v2/campus/${campusId}/users` +
          `?filter[pool_month]=${month}&filter[pool_year]=${year}` +
          `&page[size]=${PAGE_SIZE}&page[number]=${page}`,
      );

      for (const u of batch) found.set(u.login.trim().toLowerCase(), u);
      if (batch.length < PAGE_SIZE) break;
    }

    const swimmers = [...found.keys()];
    const staffLogins = this.extraLogins().filter((l) => !found.has(l));

    const now = new Date();

    for (const [login, u] of found) {
      const identity = this.identityOf(u);
      await this.prisma.swimmer.upsert({
        where: { login },
        update: {
          ...identity,
          poolMonth: month,
          poolYear: year,
          staff: false,
          active: true,
          syncedAt: now,
        },
        create: {
          login,
          ...identity,
          poolMonth: month,
          poolYear: year,
          staff: false,
        },
      });
    }

    const staff = await this.syncStaff(staffLogins, now);

    const { count: retired } = await this.prisma.swimmer.updateMany({
      where: { syncedAt: { lt: now }, active: true },
      data: { active: false },
    });

    const inactive = await this.prisma.swimmer.findMany({
      where: { active: false },
      select: { login: true },
    });

    this.logger.log(
      `piscine ${month} ${year} campus ${campusId}: ${swimmers.length} piscineux, ${staff} hors-piscine`,
    );
    if (retired) this.logger.log(`${retired} login(s) désactivés ce sync`);
    if (inactive.length)
      this.logger.log(
        `${inactive.length} inactif(s): ${inactive.map((s) => s.login).join(', ')}`,
      );

    return { swimmers: swimmers.length, staff, retired };
  }
}
