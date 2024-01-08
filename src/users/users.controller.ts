import {
  Controller,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserId } from 'src/auth/decorators/userId.decorator';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { TransformInterceptor } from 'src/libs/TransformInterceptor';

@Controller('/v1/user')
@UseInterceptors(TransformInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Put('/update')
  async update(@UserId() userId: string, @Req() req: Request) {
    const data = req.body;
    return this.usersService.update(userId, data);
  }
}
