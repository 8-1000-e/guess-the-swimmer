import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "src/prisma/prisma.service";
import { UnauthorizedException } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { randomBytes } from "crypto";

type LetterState = 'correct' | 'present' | 'absent';

type LetterResult = {
    letter: string;
    state: LetterState;
};


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

    @Cron('0 0 * * *', { timeZone: 'Europe/Paris' })
    async expireRounds() 
    {
        await this.prisma.round.updateMany({
            where: {status: {in: ["playing", "solved"]}, assignedOn: {lt: this.today() }},
            data: {
                status: 'expired'
            }
        });
    }

    private scoreGuess(value: string, target: string): LetterResult[]
    {
        const result: LetterResult[] = [...value].map(letter => ({ letter, state: 'absent' as LetterState }));
        const remaining = new Map<string, number>();

        for (let i = 0; i < target.length; i++)
        {
            if (value[i] === target[i])
                result[i].state = 'correct';
            else
                remaining.set(target[i], (remaining.get(target[i]) ?? 0) + 1);
        }

        for (let i = 0; i < result.length; i++)
        {
            if (result[i].state === 'correct')
                continue;

            const left = remaining.get(value[i]) ?? 0;
            if (left > 0)
            {
                result[i].state = 'present';
                remaining.set(value[i], left - 1);
            }
        }

        return result;
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

        return {length: target.length, guesses: [] };
    }

    async guess(ftId: string, value: string)
    {
        const user = await this.prisma.user.findUnique({where: {ftId}});
        if (!user) throw new UnauthorizedException();

        const round = await this.prisma.round.findUnique({
            where: {playerId_assignedOn: { playerId: ftId, assignedOn: this.today()}},
        });
        if (!round)
                throw new BadRequestException();
        if (round.status !== 'playing')
            throw new BadRequestException("Target already found")
        if (value.length < round.targetLogin.length)
            throw new BadRequestException("Guess too short")
        if (value.length > round.targetLogin.length)
            throw new BadRequestException("Guess too long")
        const existing = await this.prisma.swimmer.findUnique({
            where: {login: value},
            select: {login: true},
        });
        if (!existing)
            throw new BadRequestException("Not a valid login")

        const result = this.scoreGuess(value, round.targetLogin);
        const solved = value === round.targetLogin;

        await this.prisma.guess.create({
            data: {
                roundId: round.id,
                value,
                result,
            }
        });

        const updated = await this.prisma.round.update({
            where: {id: round.id},
            data: {
                attempts: { increment: 1 },
                status: solved ? 'solved' : 'playing',
                solvedAt: solved ? new Date() : null,
            }
        });

        return { result, solved, attempts: updated.attempts };
    }

    async targets(ftId: string)
    {
        const user = await this.prisma.user.findUnique({where: {ftId}});
        if (!user) throw new UnauthorizedException();

        const rounds = await this.prisma.round.findMany({
            where: {playerId: ftId},
            select: {targetLogin: true, status: true},
        });

        const today = await this.prisma.round.findUnique({
            where: {playerId_assignedOn: {playerId: ftId, assignedOn: this.today()}},
            include: {guesses: {select: {value: true}}},
        });

        const validated = new Set(rounds.filter(r => r.status === 'validated').map(r => r.targetLogin));
        const solved = new Set(rounds.filter(r => r.status === 'solved').map(r => r.targetLogin));
        const guessed = new Set(today?.guesses.map(g => g.value) ?? []);

        const swimmers = await this.prisma.swimmer.findMany({
            where: {login: {notIn: [user.login, "edubois-"]}},
            select: {login: true},
            orderBy: {login: 'asc'},
        });

        return swimmers.map(s => ({
            login: s.login,
            validated: validated.has(s.login),
            solved: solved.has(s.login),
            guessed: guessed.has(s.login),
        }));
    }

    async getQrToken(ftId: string)
    {
        const user = await this.prisma.user.findUnique({where: {ftId}});
        if (!user) throw new UnauthorizedException();

        const round = await this.prisma.round.findUnique({
            where: {playerId_assignedOn: { playerId: ftId, assignedOn: this.today()}},
        });
        if (!round)
            throw new BadRequestException();
        if (round.status !== 'solved')
            throw new BadRequestException('Target still not found');
        const token = randomBytes(16).toString('hex');
        const expiresAt = new Date(Date.now() + this.config.get<number>('SIGN_TOKEN_TTL', 60) * 1000)

        await this.prisma.round.update({
            where: {id: round.id},
            data: {
                signToken: token,
                signTokenExpiresAt: expiresAt,
            }
        })
        return {token, expiresAt};
    }

    async sign(scannerFtId: string, token: string)
    {
        const scanner = await this.prisma.user.findUnique({where: {ftId: scannerFtId}});
        if (!scanner) throw new UnauthorizedException();

        const round = await this.prisma.round.findUnique({
            where: {signToken: token},
        });
        if (!round)
            throw new BadRequestException('Invalid token');
        if (!round.signTokenExpiresAt || round.signTokenExpiresAt < new Date())
            throw new BadRequestException('Token expired');
        if (round.status !== 'solved')
            throw new BadRequestException('Round already validated');
        if (round.targetLogin !== scanner.login)
            throw new BadRequestException('You are not the target');
        if (round.playerId === scanner.ftId)
            throw new BadRequestException('You cannot sign your own round');

        const bonus = Number(this.config.get('SIGN_BONUS_ATTEMPTS') ?? 5);

        const { count } = await this.prisma.round.updateMany({
            where: {id: round.id, status: 'solved', signToken: token},
            data: {
                status: 'validated',
                validatedAt: new Date(),
                signToken: null,
                signTokenExpiresAt: null,
                attempts: Math.max(0, round.attempts - bonus),
            }
        });
        if (count === 0)
            throw new BadRequestException('Round already validated');

        const player = await this.prisma.user.findUnique({
            where: {ftId: round.playerId},
            select: {login: true, name: true},
        });

        return {validated: true, player, bonus};
    }

    async leaderboard()
    {
        const users = await this.prisma.user.findMany({
            include: {rounds: {select: {status: true, attempts: true}}},
        });

        return users
            .map(u => ({
                login: u.login,
                ftPfpUrl: u.ftPfpUrl,
                validated: u.rounds.filter(r => r.status === 'validated').length,
                attempts: u.rounds.reduce((sum, r) => sum + r.attempts, 0),
                played: u.rounds.length,
            }))
            .sort((a, b) => b.validated - a.validated || a.attempts - b.attempts)
            .map((row, i) => ({rank: i + 1, ...row}));
    }
}

