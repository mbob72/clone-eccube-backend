import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MollieService } from './mollie.service';
import { MollieController } from './mollie.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [HttpModule, UsersModule],
  controllers: [MollieController],
  providers: [MollieService, ConfigService, JwtService],
})
export class MollieModule {}
