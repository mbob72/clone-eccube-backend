import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
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
  @IsNotEmpty()
  public vatNumber: string;

  @IsString()
  @IsNotEmpty()
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
