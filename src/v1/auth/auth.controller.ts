import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import {
  CurrentUser,
  IDecoratorUser,
} from '../../commons/decorators/current-user.decorator';
import { Public } from '../../commons/decorators/public-request.decorator';
import { AuthService } from './services/auth.service';
import {
  RefreshTokenDto,
  ResetPasswordDto,
  SendCodeDto,
  SignInDto,
  SignUpDto,
  UpdatePasswordDto,
  UpdateProfileDto,
} from './dto';
import { VERSION_ONE } from '../../commons/constants';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller(`${VERSION_ONE}/auth`)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @Public()
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('verify-email')
  @Public()
  verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }
  @Post('resend-email-token')
  @Public()
  resendEmailToken(@Body() resendCodeDto: Pick<VerifyEmailDto, 'email'>) {
    return this.authService.resendEmailVerificationToken(resendCodeDto);
  }

  @Post('login')
  @Public()
  signIn(@Body() signInDto: SignInDto, @Request() req: any) {
    const { ip, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';

    return this.authService.signIn(signInDto, { ip, originalUrl, userAgent });
  }

  @Post('forgot-password')
  @Public()
  async forgotPassword(@Body() sendCodeDto: SendCodeDto) {
    return this.authService.sendPasswordResetLink(sendCodeDto);
  }

  @Post('reset-password')
  @Public()
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('refresh-token')
  @Public()
  getNewRefreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.generateNewAccessToken(refreshTokenDto);
  }

  @Patch('profile')
  updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @CurrentUser() user: IDecoratorUser,
  ) {
    return this.authService.updateProfile(updateProfileDto, user);
  }

  @Patch('password')
  updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @CurrentUser() user: IDecoratorUser,
  ) {
    return this.authService.updatePassword(updatePasswordDto, user);
  }

  @Delete('account')
  deleteAccount(@CurrentUser() user: IDecoratorUser) {
    return this.authService.deleteAccount(user);
  }

  @Get('me')
  me(
    @CurrentUser()
    {
      firstname,
      lastname,
      email,
      emailVerified,
      publicId,
      createdAt,
      updatedAt,
      deletedAt,
      emailVerifiedAt,
      isAdmin
    }: IDecoratorUser,
  ) {
    // Sending only essential and non-sensitive information
    return {
      firstname,
      lastname,
      email,
      emailVerified,
      isAdmin,
      publicId,
      createdAt,
      updatedAt,
      deletedAt,
      emailVerifiedAt,
    };
  }
}
