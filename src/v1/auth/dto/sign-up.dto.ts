import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';

export class SignUpDto {
  @IsNotEmpty()
  @IsString()
  firstname: string;

  @IsNotEmpty()
  @IsString()
  lastname: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @MinLength(8)
  @IsString()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must be at least 8 characters long, contain 1 uppercase, 1 lowercase, 1 special character and a number',
    },
  )
  password: string; // Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character:
}
