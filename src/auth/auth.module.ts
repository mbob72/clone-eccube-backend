import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './lib/local.strategy';
import { CryptService } from './lib/crypt.service';
import { TokenService } from './lib/token.service';
import { CookiesService } from './lib/cookies.service';
import { AuthController } from './auth.controller';
import { AccessTokenStrategy } from './lib/accessToken.strategy';
import { RefreshTokenStrategy } from './lib/refreshToken.strategy';

@Module({
  imports: [UsersModule, PassportModule, JwtModule.register({})],
  providers: [
    AuthService,
    {
      inject: [ConfigService],
      provide: CookiesService,
      useFactory(configService: ConfigService): CookiesService {
        const cookieName = configService.get<string>('COOKIE_NAME');
        const cookieDomain = configService.get<string>('COOKIE_DOMAIN');
        if (!cookieName) {
          throw new Error('COOKIE_NAME is not defined');
        }
        return new CookiesService({
          cookieName,
          cookieDomain,
          allowSameSiteNone: !!process.env.ALLOW_NO_SAME_SITE,
        });
      },
    },
    CryptService,
    TokenService,
    LocalStrategy,
    AccessTokenStrategy,
    RefreshTokenStrategy,
  ],
  exports: [
    AuthService,
    CookiesService,
    CryptService,
    TokenService,
    LocalStrategy,
    AccessTokenStrategy,
    RefreshTokenStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
