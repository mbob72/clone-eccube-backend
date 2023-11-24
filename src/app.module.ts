import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MollieModule } from './mollie/mollie.module';

@Module({
  imports: [AuthModule, MollieModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
