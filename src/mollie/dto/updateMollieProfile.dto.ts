import { PartialType } from '@nestjs/mapped-types';
import { CreateMollieProfileDto } from './createMollieProfile.dto';

export class UpdateMollieProfileDto extends PartialType(
  CreateMollieProfileDto,
) {}
