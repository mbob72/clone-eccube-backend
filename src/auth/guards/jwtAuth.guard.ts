import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { extractJwtTokenFromRequest } from '../lib/utils';
import { IJwtPayload } from '../types/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
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
    const token = extractJwtTokenFromRequest(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const secret = this.configService.get<string>('jwtSecret');
      const payload = this.jwtService.verify<IJwtPayload>(token, { secret });
      // set the payload to the request object for access in route handlers
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }

    return super.canActivate(context);
  }
}

// ANOTHER SOLUTION::

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
// import { extractJwtTokenFromRequest } from '../lib/utils';
// import { ConfigService } from '@nestjs/config';
// import { IJwtPayload } from '../types/jwt';

// @Injectable()
// export class JwtAuthGuard implements CanActivate {
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
//     const token = extractJwtTokenFromRequest(request);
//     if (!token) {
//       throw new UnauthorizedException();
//     }

//     try {
//       const secret = this.configService.get<string>('jwtSecret');
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
// }
