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
    const payload = {
      iss: JwtConstants.issuer,
      guest: options.guest,
      userId,
    };
    const secret = this.configService.get<string>('jwtSecret');
    if (!secret) {
      throw new Error('JWT secret is not defined');
    }
    return this.jwtService.sign(payload, {
      expiresIn: JwtConstants.credentialsLifetime,
      secret,
    });
  }

  createRefreshToken(
    userId: string,
    options: { guest: boolean } = { guest: false },
  ): string {
    const payload = {
      iss: JwtConstants.issuer,
      guest: options.guest,
      userId,
    };
    const secret = this.configService.get<string>('jwtRefreshSecret');
    if (!secret) {
      throw new Error('Refresh JWT secret is not defined');
    }
    return this.jwtService.sign(payload, {
      expiresIn: JwtConstants.refreshTokenLifetime,
      secret,
    });
  }

  extractExpirationDate(token: string) {
    const { exp } = this.jwtService.decode(token) as { exp: number };
    return exp; // new Date(exp * 1000);
  }

  createResetPasswordToken(userId: string): string {
    const payload = {
      iss: JwtConstants.issuer,
      user_id: userId,
    };
    return this.jwtService.sign(payload, {
      algorithm: 'HS256',
      expiresIn: JwtConstants.resetPasswordLifetime,
    });
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
