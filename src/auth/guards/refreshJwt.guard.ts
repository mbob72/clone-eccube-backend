import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import {
  extractJwtTokenFromRequest,
  extractRefreshTokenFromHeader,
} from '../lib/utils';
import { IJwtPayload } from '../types/jwt';

@Injectable()
export class RefreshJwtGuard extends AuthGuard('jwt-refresh') {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private configService: ConfigService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const accessToken = extractJwtTokenFromRequest(request);
    const refreshToken = extractRefreshTokenFromHeader(request);
    if (!accessToken || !refreshToken) {
      throw new UnauthorizedException();
    }

    try {
      const accessSecret = this.configService.get<string>('jwtSecret');
      this.jwtService.verify<IJwtPayload>(accessToken, {
        secret: accessSecret,
        ignoreExpiration: true,
      });

      const refreshSecret = this.configService.get<string>('jwtRefreshSecret');
      const payload = this.jwtService.verify<IJwtPayload>(refreshToken, {
        secret: refreshSecret,
      });
      // set the payload to the request object for access in route handlers
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }

    return super.canActivate(context);
  }
}

// import {
//   CanActivate,
//   ExecutionContext,
//   // ExecutionContext,
//   Injectable,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
// import { JwtService } from '@nestjs/jwt';
// import { ConfigService } from '@nestjs/config';
// import { Request } from 'express';
// import { IJwtPayload } from '../types/jwt';

// @Injectable()
// export class RefreshJwtGuard implements CanActivate {
//   constructor(
//     private jwtService: JwtService,
//     private reflector: Reflector,
//     private configService: ConfigService,
//   ) {}

//   async canActivate(context: ExecutionContext) {
//     // if controller's method has @Public() decorator, then allow access
//     const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
//       context.getHandler(),
//       context.getClass(),
//     ]);
//     if (isPublic) {
//       return true;
//     }

//     const request = context.switchToHttp().getRequest();
//     const token = this.extractJwtTokenFromHeader(request);
//     if (!token) {
//       throw new UnauthorizedException();
//     }

//     try {
//       const secret = this.configService.get<string>('jwtRefreshSecret');
//       const payload = await this.jwtService.verifyAsync<IJwtPayload>(token, {
//         secret,
//       });
//       // set the payload to the request object for access in route handlers
//       request['user'] = payload;
//     } catch {
//       throw new UnauthorizedException();
//     }
//     return true;
//   }

//   private extractJwtTokenFromHeader(req: Request) {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) return null;
//     const [type, token] = authHeader?.split(' ') || [];
//     if (type !== 'Refresh' || !token) return null;
//     return token;
//   }
// }
