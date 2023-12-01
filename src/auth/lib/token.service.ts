import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtConstants } from './constants';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  createToken(
    userId: string,
    options: { guest: boolean } = { guest: false },
  ): string {
    const nowTimestamp = Math.floor(Date.now() / 1000);
    const payload = {
      aud: JwtConstants.issuer,
      iss: JwtConstants.issuer,
      iat: nowTimestamp,
      exp: nowTimestamp + JwtConstants.credentialsLifetime,
      guest: options.guest,
      user_id: userId,
    };
    return this.jwtService.sign(payload);
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
