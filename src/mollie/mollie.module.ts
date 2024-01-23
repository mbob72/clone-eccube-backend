import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MollieService } from './mollie.service';
import { MollieController } from './mollie.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtService } from '@nestjs/jwt';
import { OrganizationsModule } from 'src/organizations/organizations.module';

@Module({
  imports: [HttpModule, UsersModule, OrganizationsModule],
  controllers: [MollieController],
  providers: [MollieService, ConfigService, JwtService],
})
export class MollieModule {}
