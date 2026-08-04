import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { FtApiModule } from './ftapi/ftapi.module';
import { PoolModule } from './pool/pool.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    FtApiModule,
    AuthModule,
    PoolModule,
  ],
})
export class AppModule {}
