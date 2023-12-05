import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './lib/local.strategy';
import { CryptService } from './lib/crypt.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtConstants } from './lib/constants';
import { TokenService } from './lib/token.service';
import { CookiesService } from './lib/cookies.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './lib/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwtAuth.guard';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: JwtConstants.secret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [
    AuthService,
    {
      provide: CookiesService,
      useFactory(): CookiesService {
        return new CookiesService({
          cookieName: process.env.COOKIE_NAME || 'token',
          cookieDomain: process.env.COOKIE_DOMAIN,
          cookieLifetime: JwtConstants.credentialsLifetime,
          allowSameSiteNone: !!process.env.ALLOW_NO_SAME_SITE,
        });
      },
    },
    CryptService,
    TokenService,
    LocalStrategy,
    JwtStrategy,
    // set global guard for module
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [
    AuthService,
    CookiesService,
    CryptService,
    TokenService,
    LocalStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
