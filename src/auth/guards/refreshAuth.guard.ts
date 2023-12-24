import {
  CanActivate,
  ExecutionContext,
  // ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { IJwtPayload } from '../types/jwt';

@Injectable()
export class RefreshJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext) {
    // if controller's method has @Public() decorator, then allow access
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractJwtTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const secret = this.configService.get<string>('jwtRefreshSecret');
      const payload = await this.jwtService.verifyAsync<IJwtPayload>(token, {
        secret,
      });
      // set the payload to the request object for access in route handlers
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractJwtTokenFromHeader(req: Request) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;
    const [type, token] = authHeader?.split(' ') || [];
    if (type !== 'Refresh' || !token) return null;
    return token;
  }
}
