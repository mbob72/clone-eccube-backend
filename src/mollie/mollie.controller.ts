import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MollieService } from './mollie.service';
import { CreateMollieDto } from './dto/create-mollie.dto';
import { UpdateMollieDto } from './dto/update-mollie.dto';

@Controller('mollie')
export class MollieController {
  constructor(private readonly mollieService: MollieService) {}

  @Post()
  create(@Body() createMollieDto: CreateMollieDto) {
    return this.mollieService.create(createMollieDto);
  }

  @Get()
  findAll() {
    return this.mollieService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mollieService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMollieDto: UpdateMollieDto) {
    return this.mollieService.update(+id, updateMollieDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mollieService.remove(+id);
  }
}
