import { IsNotEmpty, IsEmail, MaxLength, IsString } from 'class-validator';

export class VerifyEmailDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(6)
  code: number;
}
