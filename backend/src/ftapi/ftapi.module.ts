import { Module } from '@nestjs/common';
import { FtApiService } from './ftapi.service';

@Module({
  providers: [FtApiService],
  exports: [FtApiService],
})
export class FtApiModule {}
