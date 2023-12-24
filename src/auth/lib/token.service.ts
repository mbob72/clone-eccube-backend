import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtConstants } from './constants';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  createToken(
    userId: string,
    options: { guest: boolean } = { guest: false },
  ): string {
    const nowTimestamp = Math.floor(Date.now() / 1000);
    const payload = {
      aud: JwtConstants.issuer,
      iss: JwtConstants.issuer,
      iat: nowTimestamp,
      guest: options.guest,
      userId,
    };
    return this.jwtService.sign(payload, { expiresIn: '5h' });
  }

  createRefreshToken(
    userId: string,
    options: { guest: boolean } = { guest: false },
  ): string {
    const nowTimestamp = Math.floor(Date.now() / 1000);
    const payload = {
      aud: JwtConstants.issuer,
      iss: JwtConstants.issuer,
      iat: nowTimestamp,
      guest: options.guest,
      userId,
    };
    return this.jwtService.sign(payload, {
      expiresIn: '7h',
      secret: this.configService.get<string>('jwtRefreshSecret'),
    });
  }

  createResetPasswordToken(
    userId: string,
    lifeTime = JwtConstants.resetPasswordLifetime,
  ): string {
    const nowTimestamp = Math.floor(Date.now() / 1000);
    const payload = {
      aud: JwtConstants.issuer,
      iss: JwtConstants.issuer,
      user_id: userId,
      iat: nowTimestamp,
      exp: nowTimestamp + lifeTime,
    };
    return this.jwtService.sign(payload, { algorithm: 'HS256' });
  }

  // createExtraditionFileToken(): string {
  //   const nowTimestamp = Math.floor(Date.now() / 1000);
  //   const payload = {
  //  aud: jwtConstants.issuer,
  // iss: jwtConstants.issuer,
  //     iat: nowTimestamp,
  //     exp: nowTimestamp + EXTRADITION_FILE_SIGN_LIFETIME,
  //   };
  //   return this.jwtService.sign(payload, { algorithm: 'HS256' });
  // }

  verifyToken(token: string): boolean {
    try {
      this.jwtService.verify(token);
      return true;
    } catch {}
    return false;
  }
}
