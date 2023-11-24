import { Module } from '@nestjs/common';
import { MollieService } from './mollie.service';
import { MollieController } from './mollie.controller';

@Module({
  controllers: [MollieController],
  providers: [MollieService],
})
export class MollieModule {}
