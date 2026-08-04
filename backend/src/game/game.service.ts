import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "src/prisma/prisma.service";
import { UnauthorizedException } from "@nestjs/common";

@Injectable()
export class GameService 
{
    constructor (
        private readonly prisma: PrismaService,
        private readonly config: ConfigService,
    )
    {}

    private today(): Date
    {
        const parts = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Europe/Paris',
          year: 'numeric', month: '2-digit', day: '2-digit',
        }).formatToParts(new Date())

        const get = (type: string) => parts.find(p => p.type === type)!.value;

        return new Date(`${get('year')}-${get('month')}-${get('day')}T00:00:00Z`);
    }

    async getTodayRound(ftId: string)
    {
        const user = await this.prisma.user.findUnique({where: {ftId}});
        if (!user) throw new UnauthorizedException();

        const existing = await this.prisma.round.findUnique({
          where: { playerId_assignedOn: { playerId: ftId, assignedOn: this.today() } },
          include: { guesses: { orderBy: { createdAt: 'asc' } } },
        });

        if (existing) 
            return { length: existing.targetLogin.length, guesses: existing.guesses };


        const alreadyFound = await this.prisma.round.findMany({
            where: {playerId: ftId, status: 'validated' },
            select: {targetLogin: true},
        });

        const excluded = alreadyFound.map(r => r.targetLogin);

        excluded.push(user.login);
        excluded.push("edubois-");

        const potentialTargets = await this.prisma.swimmer.findMany({
            where: {login: { notIn: excluded}},
            select: {login: true},
        });
        
        const targets = potentialTargets.map(r => r.login);
        const target = targets[Math.floor(Math.random() * targets.length)];

        await this.prisma.round.create({
            data:
            {
                playerId: user.ftId,
                targetLogin: target,
                assignedOn: this.today(),
            }
        });

        return target.length;
    }

    guess(ftId: string, value: string)
    {

    }

    getQrToken(ftId: string, roundId: string)
    {

    }

    sign(scannerFtId: string, token: string)
    {

    }

    pending(ftId: string)
    {

    }

    leaderboard()
    {

    }
}

