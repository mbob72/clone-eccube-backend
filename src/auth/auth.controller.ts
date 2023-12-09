import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/localAuth.guard';
import { CookiesService } from './lib/cookies.service';
import { UserId } from './decorators/userId.decorator';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { Public } from './decorators/public.decorator';

@Controller('/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookiesService: CookiesService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/register')
  async registerUser(
    @Body() createUserDto: CreateUserDto,
    // @Req() req: Request,
  ): Promise<void> {
    // const origin = req.header('Origin');
    await this.authService.registerUser(createUserDto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async loginUser(
    @UserId() userId: string, // extract userId from LocalStrategy `validate` method
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ token: string }> {
    // const userRestriction =
    //   await this.restrictionService.getUserRestriction(userId);
    // if (userRestriction === USER_RESTRICTION_LOGIN_BLOCK) {
    //   throw new ForbiddenException();
    // }
    const token = await this.authService.getJwtToken(userId);
    this.cookiesService.writeTokenInCookies(res, token);
    return { token };
  }

  @Post('/logout')
  async logoutUser(@Res({ passthrough: true }) res: Response): Promise<void> {
    this.cookiesService.removeTokenInCookies(res);
  }
}
