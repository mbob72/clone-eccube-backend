import { Injectable } from '@nestjs/common';
import { CreateMollieDto } from './dto/create-mollie.dto';
import { UpdateMollieDto } from './dto/update-mollie.dto';

@Injectable()
export class MollieService {
  create(createMollieDto: CreateMollieDto) {
    return 'This action adds a new mollie';
  }

  findAll() {
    return `This action returns all mollie`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mollie`;
  }

  update(id: number, updateMollieDto: UpdateMollieDto) {
    return `This action updates a #${id} mollie`;
  }

  remove(id: number) {
    return `This action removes a #${id} mollie`;
  }
}
