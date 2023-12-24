import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './lib/local.strategy';
import { CryptService } from './lib/crypt.service';
import { JwtConstants } from './lib/constants';
import { TokenService } from './lib/token.service';
import { CookiesService } from './lib/cookies.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './lib/jwt.strategy';
// import { JwtAuthGuard } from './guards/jwtAuth.guard';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        const secret = configService.get<string>('jwtSecret');
        if (!secret) {
          throw new Error('JWT secret is not defined');
        }
        return {
          // global: true,
          secret,
          signOptions: {
            expiresIn: '5h',
            // algorithm: 'HS512',
          },
        };
      },
    }),
  ],
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
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
  ],
  exports: [
    AuthService,
    CookiesService,
    CryptService,
    TokenService,
    LocalStrategy,
    JwtStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
