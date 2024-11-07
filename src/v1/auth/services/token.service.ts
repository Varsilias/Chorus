import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../../v1/config/config.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signAccessToken(payload: { email: string; sub: string }) {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: `${this.configService.JWT_ACCESS_TOKEN_EXPIRY}m`,
    });
  }

  async signRefreshToken(payload: { email: string; sub: string }) {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: `${this.configService.JWT_REFRESH_TOKEN_EXPIRY}d`,
    });
  }

  async signPasswordResetToken(payload: { email: string; sub: string }) {
    return this.jwtService.signAsync(payload, {
      secret: `${this.configService.JWT_ACCESS_TOKEN_SECRET}<==>${this.configService.JWT_REFRESH_TOKEN_SECRET}`,
      expiresIn: `15m`,
    });
  }

  async verifyPasswordResetToken(token: string) {
    return this.jwtService.verifyAsync(token, {
      secret: `${this.configService.JWT_ACCESS_TOKEN_SECRET}<==>${this.configService.JWT_REFRESH_TOKEN_SECRET}`,
    });
  }
  async verifyAccessToken(accessToken: string) {
    return this.jwtService.verifyAsync(accessToken, {
      secret: this.configService.JWT_ACCESS_TOKEN_SECRET,
    });
  }
  async verifyRefreshToken(refreshToken: string) {
    return this.jwtService.verifyAsync(refreshToken, {
      secret: this.configService.JWT_REFRESH_TOKEN_SECRET,
    });
  }
}
