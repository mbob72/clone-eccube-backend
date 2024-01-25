import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { UpdateMollieProfileDto } from 'src/mollie/dto/updateMollieProfile.dto';
import { CreateUserDto } from 'src/users/dto/createUser.dto';

export class UpdateOrganizationDto extends UpdateMollieProfileDto {
  @ValidateNested()
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => CreateUserDto)
  @IsOptional()
  representatives: CreateUserDto[];
}
