import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { IsMatchingPassword } from '../../../commons/validators/is-matching-password.dto';

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'newPassword must be at least 8 characters long, contain 1 uppercase, 1 lowercase, 1 special character and a number',
    },
  )
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @IsMatchingPassword('newPassword', {
    message: 'confirmPassword must be the same as newPassword',
  })
  confirmPassword: string;
}
