import {
  Body,
  Controller,
  Get,
  Post,
  // Put,
  // Req,
  UseGuards,
} from '@nestjs/common';
// import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { OrganizationsService } from './organizations.service';
import { UserId } from 'src/auth/decorators/userId.decorator';
import { CreateOrganizationDto } from './dto/createOrganization.dto';

@Controller('/v1/organization')
// @UseInterceptors(TransformInterceptor)
export class OrganizationsController {
  constructor(private readonly orgsService: OrganizationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/current')
  async get(@UserId() userId: string) {
    return this.orgsService.getCurrent(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/create')
  async create(
    @UserId() userId: string,
    @Body() createDto: CreateOrganizationDto,
  ) {
    return this.orgsService.create(userId, createDto);
  }

  // @UseGuards(JwtAuthGuard)
  // @Put('/update')
  // async update(@Req() req: Request, @Body() updateDto: UpdateMollieProfileDto) {
  //   const id = req.user.organizationId;
  //   return this.orgsService.update(id, updateDto);
  // }
}
