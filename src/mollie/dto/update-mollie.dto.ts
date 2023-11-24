import { PartialType } from '@nestjs/mapped-types';
import { CreateMollieDto } from './create-mollie.dto';

export class UpdateMollieDto extends PartialType(CreateMollieDto) {}
