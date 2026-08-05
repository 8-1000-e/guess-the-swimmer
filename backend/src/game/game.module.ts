import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { FtApiModule } from '../ftapi/ftapi.module';
import { GameController } from './game.controller';
import { GameService } from './game.service';

@Module({
  imports: [AuthModule, FtApiModule],
  controllers: [GameController],
  providers: [GameService],
  exports: [GameService],
})
export class GameModule {}
