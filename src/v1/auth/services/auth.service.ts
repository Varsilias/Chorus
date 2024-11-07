import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import * as utils from '../../../commons/utils';
import { UserService } from '../_users/services/user.service';
import {
  SignUpDto,
  SignInDto,
  RefreshTokenDto,
  SendCodeDto,
  ResetPasswordDto,
  UpdateProfileDto,
  UpdatePasswordDto,
} from '../dto';
import { TokenService } from './token.service';
import * as crypto from 'crypto';
import { SessionService } from '../_users/services/session.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { PasswordResetService } from '../_users/services/password-reset.service';
import { ConfigService } from '../../config/config.service';
import { IDecoratorUser } from '../../../commons/decorators/current-user.decorator';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
    private readonly notificationService: NotificationsService,
    private readonly passwordResetService: PasswordResetService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}
  async signUp(signUpDto: SignUpDto) {
    const { email, password } = signUpDto;
    const userExists = await this.userService.findUserBy({ email });

    if (userExists) {
      throw new ConflictException('Email already taken', null);
    }

    try {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = utils.hashPassword(password, salt);
      const securityToken = utils.generateSixDigitNumber();

      const user = await this.userService.createUser({
        ...signUpDto,
        password: hash,
        salt: salt,
        securityToken,
        securityTokenRequestedAt: new Date(),
      });

      // TODO: Send Token as email

      const welcomeEmailPayload = {
        name: user.firstname,
        email: user.email,
        token: user.securityToken,
        subject: 'Welcome to Chorus',
        remark: `This token expires expires in 3 minutes`,
      };

      this.notificationService.sendWelcomeEmail(welcomeEmailPayload);

      return {
        message: 'A token has been sent to your registered email',
        user,
      };
    } catch (error: any) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Something went wrong, we are fixing it',
        null,
      );
    }
  }

  async signIn(
    signInDto: SignInDto,
    {
      ip,
      originalUrl,
      userAgent,
    }: { ip: string; originalUrl: string; userAgent: string },
  ) {
    try {
      const { email, password: userPassword } = signInDto;

      const user = await this.userService.findUserBy({ email });
      if (!user) {
        throw new BadRequestException('Invalid Credentials');
      }
      if (user.deletedAt !== null) {
        throw new NotFoundException(`User not found`, null);
      }
      if (user.isBlocked || user.blockedAt !== null) {
        throw new BadRequestException(
          'Your account has been blocked, please contact support',
        );
      }
      const isPasswordMatch = utils.comparePassword(
        userPassword,
        user.salt,
        user.password,
      );
      if (!isPasswordMatch) {
        throw new BadRequestException('Invalid Credentials');
      }
      const payload = {
        sub: user.publicId,
        email: user.email,
      };
      const accessToken = await this.tokenService.signAccessToken(payload);
      const refreshToken = await this.tokenService.signRefreshToken(payload);

      this.sessionService.createSessionEntry({
        ip_address: ip,
        last_activity: new Date(),
        user_agent: userAgent,
        user,
        payload: JSON.stringify({ ip, originalUrl, userAgent }),
      });
      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: user,
      };
    } catch (error) {
      this.logger.error(error?.message);

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        error?.message ?? 'Something went wrong, we are fixing it',
      );
    }
  }

  async generateNewAccessToken(refreshTokenDto: RefreshTokenDto) {
    const { refresh_token } = refreshTokenDto;

    try {
      const { sub, email } =
        await this.tokenService.verifyRefreshToken(refresh_token);

      const user = await this.userService.findUserBy({ email, publicId: sub });

      if (user.deletedAt !== null) {
        throw new NotFoundException(`User not found`, null);
      }

      if (user.isBlocked || user.blockedAt !== null) {
        throw new BadRequestException(
          'Your account has been blocked, please contact support',
        );
      }

      const payload = {
        sub: user.publicId,
        email: user.email,
      };

      const accessToken = await this.tokenService.signAccessToken(payload);
      const refreshToken = await this.tokenService.signRefreshToken(payload);

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: user,
      };
    } catch (error: any) {
      this.logger.error(error?.message);

      if (error instanceof JsonWebTokenError) {
        throw new BadRequestException(error?.message ?? 'Invalid Token', null);
      }

      if (error instanceof TokenExpiredError) {
        throw new BadRequestException(error?.message ?? 'Token Expired', null);
      }

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        error?.message ?? 'Something went wrong, we are fixing it',
        null,
      );
    }
  }

  async validateUser(access_token: string) {
    try {
      const { sub, email } =
        await this.tokenService.verifyAccessToken(access_token);

      const user = await this.userService.findUserBy({ email, publicId: sub });

      if (user.deletedAt !== null) {
        throw new NotFoundException(`User not found`, null);
      }

      if (user.isBlocked || user.blockedAt !== null) {
        throw new BadRequestException(
          'Your account has been blocked, please contact support',
        );
      }

      return user;
    } catch (error: any) {
      this.logger.error(error?.message);

      if (error instanceof JsonWebTokenError) {
        throw new BadRequestException(error?.message ?? 'Invalid Token');
      }

      if (error instanceof TokenExpiredError) {
        throw new BadRequestException(error?.message ?? 'Token Expired');
      }

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        error?.message ?? 'Something went wrong, we are fixing it',
      );
    }
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const { code, email } = verifyEmailDto;

    try {
      const userExists = await this.userService.findUserBy({
        securityToken: code,
        email,
      });

      if (!userExists) {
        throw new BadRequestException('Verification failed');
      }

      if (!utils.isSecurityTokenValid(userExists.securityTokenRequestedAt)) {
        throw new BadRequestException('Code has expired, request a new code');
      }

      this.userService.updateUser(userExists.publicId, {
        emailVerified: true,
        emailVerifiedAt: new Date(),
        securityToken: null,
        securityTokenRequestedAt: null,
      });
      return { message: 'Email Verification Successful' };
    } catch (error) {
      this.logger.error(error?.message);

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(error?.message);
    }
  }

  async resendEmailVerificationToken(
    resendCodeDto: Pick<VerifyEmailDto, 'email'>,
  ) {
    const { email } = resendCodeDto;

    try {
      const userExists = await this.userService.findUserBy({ email });

      if (!userExists) {
        throw new NotFoundException('User not found');
      }

      const securityToken = utils.generateSixDigitNumber();
      this.userService.updateUser(userExists.publicId, {
        securityToken,
        securityTokenRequestedAt: new Date(),
      });

      //TODO: remove code from returned payload for security reason
      // we require code for testing
      return {
        code: securityToken,
        message: 'We sent a new code to your registered email',
      };
    } catch (error) {
      this.logger.error(error?.message);

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(error?.message);
    }
  }

  async sendPasswordResetLink(sendCodeDto: SendCodeDto) {
    try {
      const { email } = sendCodeDto;
      const user = await this.userService.findUserBy({ email });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!user.emailVerified) {
        throw new BadRequestException(
          'Please verify your email first before you can proceed',
        );
      }

      // verify if there is an entry in the password reset table
      const entry = await this.passwordResetService.findEntryBy({ email });

      // if this user has request to reset password before and the
      // token for the entry is still valid
      if (entry) {
        if (await this.isPasswordResetTokenValid(entry.token)) {
          const passwordResetLink = this.buildPasswordResetLink(entry.token);

          const passwordResetEmailPayload = {
            name: user.firstname,
            email: user.email,
            url: passwordResetLink,
            subject: 'Reset Password',
            remark: `This token expires expires in 15 minutes`,
          };

          this.notificationService.sendPasswordResetLinkEmail(
            passwordResetEmailPayload,
          );
          return {
            message:
              'Password Reset Link has been sent to your registered email',
            link: passwordResetLink,
          };
        } else {
          await this.passwordResetService.deleteEntry({
            email: entry.email,
            publicId: entry.publicId,
          });
        }
      }

      const payload = {
        email: user.email,
        sub: user.publicId,
      };

      const token = await this.tokenService.signPasswordResetToken(payload);
      const passwordResetLink = this.buildPasswordResetLink(token);

      const passwordResetEmailPayload = {
        name: user.firstname,
        email: user.email,
        url: passwordResetLink,
        subject: 'Reset Password',
        remark: `This token expires expires in less than 15 minutes`,
      };

      await this.passwordResetService.createEntry({
        email: user.email,
        token: token,
      });

      this.notificationService.sendPasswordResetLinkEmail(
        passwordResetEmailPayload,
      );
      return {
        message: 'Password Reset Link has been sent to your registered email',
        link: passwordResetLink,
      };
    } catch (error) {
      this.logger.error(error?.message);

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(error?.message);
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const { email, token, password } = resetPasswordDto;

      const isValid = await this.isPasswordResetTokenValid(token);

      if (!isValid) {
        throw new BadRequestException(
          'Invalid or Expired token, Request a new email verification link',
        );
      }
      const decoded = this.jwtService.decode(token);

      if (decoded.email !== email) {
        throw new BadRequestException('Invalid token');
      }

      const user = await this.userService.findUserBy({ email });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const salt = crypto.randomBytes(16).toString('hex');
      const hash = utils.hashPassword(password, salt);

      await this.userService.updateUser(user.publicId, {
        password: hash,
        salt,
      });

      await this.passwordResetService.deleteEntry({ email: user.email });
      const payload = {
        name: user.firstname,
        email: user.email,
        subject: 'Password Reset Successful',
        remark: `You have successfully reset your password, if you did not do this please contact support`,
      };
      this.notificationService.sendHasBeenResetEmail(payload);

      return { message: 'Password updated successfully' };
    } catch (error) {
      this.logger.error(error?.message);

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(error?.message);
    }
  }

  async updateProfile(
    updateProfileDto: UpdateProfileDto,
    user: IDecoratorUser,
  ) {
    const { publicId } = user;
    try {
      const user = await this.userService.findUserBy({ publicId });

      if (!user) {
        throw new NotFoundException('User Profile not found');
      }

      await this.userService.updateUser(publicId, updateProfileDto);
      return { message: 'Profile updated successfully' };
    } catch (error) {
      this.logger.error(error?.message);

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(error?.message);
    }
  }

  async updatePassword(
    updatePasswordDto: UpdatePasswordDto,
    user: IDecoratorUser,
  ) {
    try {
      const userExists = await this.userService.findUserBy({
        publicId: user.publicId,
      });

      if (!userExists) {
        throw new NotFoundException('User Profile not found');
      }

      const { currentPassword, newPassword, confirmPassword } =
        updatePasswordDto;

      const isPasswordMatch = utils.comparePassword(
        currentPassword,
        userExists.salt,
        userExists.password,
      );

      if (!isPasswordMatch) {
        throw new BadRequestException('Invalid Credentials');
      }

      if (newPassword !== confirmPassword) {
        throw new BadRequestException('Passwords does not match');
      }

      const salt = crypto.randomBytes(16).toString('hex');
      const hash = utils.hashPassword(newPassword, salt);

      await this.userService.updateUser(userExists.publicId, {
        salt,
        password: hash,
      });

      return { message: 'Password updated successfully' };
    } catch (error) {
      this.logger.error(error?.message);

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(error?.message);
    }
  }

  async deleteAccount(user: IDecoratorUser) {
    try {
      const userExists = await this.userService.findUserBy({
        publicId: user.publicId,
      });

      if (!userExists) {
        throw new NotFoundException('User Profile not found');
      }

      await this.userService.updateUser(userExists.publicId, {
        deletedAt: new Date(),
      });

      return { message: 'Account deleted successfully' };
    } catch (error) {
      this.logger.error(error?.message);

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(error?.message);
    }
  }

  private async isPasswordResetTokenValid(token: string) {
    try {
      await this.tokenService.verifyPasswordResetToken(token);
      return true;
    } catch (error) {
      this.logger.error(`isPasswordResetTokenValid::${error?.message}`);
      return false;
    }
  }
  private buildPasswordResetLink(token: string) {
    const url = `${this.configService.FRONTEND_URL}/email/verify?identity=${token}`;
    return url;
  }
}
