import { PartialType } from '@nestjs/mapped-types';
import { CreateMollieProfileDto } from './create-mollie-profile.dto';

export class UpdateMollieProfileDto extends PartialType(
  CreateMollieProfileDto,
) {}
