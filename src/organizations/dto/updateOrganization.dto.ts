import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
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

  @IsString()
  public vatNumber: string;

  @IsString()
  public registrationNumber: string;

  // address

  @IsString()
  public streetAndNumber: string;

  @IsString()
  public postalCode: string;

  @IsString()
  public city: string;

  @IsString()
  public country: string;
}
