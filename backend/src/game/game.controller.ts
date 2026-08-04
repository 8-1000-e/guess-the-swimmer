import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { AuthedRequest } from '../auth/authed-request';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GuessDto } from './dto/guess.dto';
import { GameService } from './game.service';

@Controller('game')
@UseGuards(JwtAuthGuard)
export class GameController {
  constructor(private readonly game: GameService) {}

  @Get('round')
  round(@Req() req: AuthedRequest) {
    return this.game.getTodayRound(req.user.sub);
  }

  @Get('targets')
  targets(@Req() req: AuthedRequest) {
    return this.game.targets(req.user.sub);
  }

  @Post('guess')
  guess(@Req() req: AuthedRequest, @Body() body: GuessDto) {
    return this.game.guess(req.user.sub, body.value);
  }
}
