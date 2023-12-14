import { IsNotEmpty, IsString } from 'class-validator';

export class OnboardingUserDto {
  @IsString()
  @IsNotEmpty()
  readonly firstName: string;

  @IsString()
  @IsNotEmpty()
  readonly lastName: string;

  @IsString()
  @IsNotEmpty()
  readonly phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  readonly address: string;

  @IsString()
  @IsNotEmpty()
  readonly company: string;
}
