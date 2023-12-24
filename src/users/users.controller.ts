import { Controller, Put, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserId } from 'src/auth/decorators/userId.decorator';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';

@Controller('/v1/user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Put('/update')
  async update(@UserId() userId: string, @Req() req: Request) {
    const data = req.body;
    return this.usersService.update(userId, data);
  }
}
