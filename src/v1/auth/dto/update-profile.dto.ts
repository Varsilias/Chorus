import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  firstname: string;

  @IsOptional()
  @IsString()
  lastname: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  email: string;
}
