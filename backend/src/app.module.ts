import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { FtApiModule } from './ftapi/ftapi.module';
import { GameModule } from './game/game.module';
import { PoolModule } from './pool/pool.module';
import { PrismaModule } from './prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    FtApiModule,
    AuthModule,
    PoolModule,
    GameModule,
  ],
})
export class AppModule {}
