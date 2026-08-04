import { Module } from '@nestjs/common';
import { FtApiModule } from '../ftapi/ftapi.module';
import { PoolService } from './pool.service';

@Module({
  imports: [FtApiModule],
  providers: [PoolService],
  exports: [PoolService],
})
export class PoolModule {}
