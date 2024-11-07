import { IsNotEmpty, IsEmail, IsString, MinLength } from 'class-validator';

export class SignInDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @MinLength(8)
  @IsString()
  @IsNotEmpty()
  password: string;
}
