import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateMollieProfileDto } from 'src/mollie/dto/createMollieProfile.dto';
import { CreateUserDto } from 'src/users/dto/createUser.dto';

export class CreateOrganizationDto extends CreateMollieProfileDto {
  @ValidateNested()
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => CreateUserDto)
  @IsOptional()
  representatives: CreateUserDto[];

  @IsString()
  @IsOptional()
  address: string;
}
