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
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CookiesService } from './lib/cookies.service';
import { UserId } from './decorators/userId.decorator';
import { CreateUserDto } from 'src/users/dto/createUser.dto';

@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookiesService: CookiesService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('/register')
  async registerUser(
    @Body() createUserDto: CreateUserDto,
    // @Req() req: Request,
  ): Promise<void> {
    // const origin = req.header('Origin');
    await this.authService.registerUser(createUserDto);
  }

  @Post('/login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async loginUser(
    @UserId() userId: string,
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
