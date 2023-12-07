import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MollieService } from './mollie.service';
import { MollieController } from './mollie.controller';

@Module({
  imports: [HttpModule],
  controllers: [MollieController],
  providers: [MollieService, ConfigService],
})
export class MollieModule {}
