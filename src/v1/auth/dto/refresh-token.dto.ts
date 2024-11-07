import { IsNotEmpty, IsString, IsJWT } from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  @IsJWT()
  refresh_token: string;
}
