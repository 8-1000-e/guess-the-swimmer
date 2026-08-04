import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FtApiService } from '../ftapi/ftapi.service';
import { PrismaService } from '../prisma/prisma.service';

interface FtCampusUser {
  id: number;
  login: string;
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

  async onModuleInit() {
    if (this.config.get('POOL_SYNC_ON_BOOT') === 'false') return;

    try {
      await this.sync();
    } catch (e) {
      this.logger.error(
        `sync impossible, la whitelist en base est conservée: ${(e as Error).message}`,
      );
    }
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

  async sync() {
    const campusId = this.config.get<string>('FT_CAMPUS_ID') ?? '31';
    const { month, year } = this.currentPool();

    const logins: string[] = [];
    for (let page = 1; ; page++) {
      const batch = await this.ft.get<FtCampusUser[]>(
        `/v2/campus/${campusId}/users` +
          `?filter[pool_month]=${month}&filter[pool_year]=${year}` +
          `&page[size]=${PAGE_SIZE}&page[number]=${page}`,
      );

      logins.push(...batch.map((u) => u.login.trim().toLowerCase()));
      if (batch.length < PAGE_SIZE) break;
    }

    const swimmers = [...new Set(logins)];
    const staff = this.extraLogins().filter((l) => !swimmers.includes(l));

    const now = new Date();

    for (const login of swimmers) {
      await this.prisma.swimmer.upsert({
        where: { login },
        update: { poolMonth: month, poolYear: year, staff: false, syncedAt: now },
        create: { login, poolMonth: month, poolYear: year, staff: false },
      });
    }

    for (const login of staff) {
      await this.prisma.swimmer.upsert({
        where: { login },
        update: { staff: true, syncedAt: now },
        create: { login, staff: true },
      });
    }

    const stale = await this.prisma.swimmer.findMany({
      where: { syncedAt: { lt: now }, staff: false },
      select: { login: true },
    });

    this.logger.log(
      `piscine ${month} ${year} campus ${campusId}: ${swimmers.length} piscineux, ${staff.length} hors-piscine`,
    );
    if (stale.length)
      this.logger.warn(
        `${stale.length} login(s) en base absents de l'API: ${stale.map((s) => s.login).join(', ')}`,
      );

    return { swimmers: swimmers.length, staff: staff.length, stale: stale.length };
  }
}
