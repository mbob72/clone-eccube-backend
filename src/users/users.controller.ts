import {
  Body,
  Controller,
  Get,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserId } from 'src/auth/decorators/userId.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { TransformInterceptor } from 'src/libs/TransformInterceptor';
import { UpdateUserDto } from './dto/updateUser.dto';

@Controller('/v1/user')
@UseInterceptors(TransformInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async get(@UserId() userId: string) {
    return this.usersService.findById(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/update')
  async update(@UserId() userId: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(userId, updateUserDto);
  }
}
