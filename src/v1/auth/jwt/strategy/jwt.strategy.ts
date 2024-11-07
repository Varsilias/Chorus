import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '../../../config/config.service';
import { UserService } from '../../_users/services/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.JWT_ACCESS_TOKEN_SECRET,
    });
  }

  /**
   *
   * TODO: Do further token validation, looking up the publicId in a list of revoked tokens,
   * enabling us to perform token revocation.
   */

  async validate(payload: any) {
    const user = await this.userService.findUserBy({
      ...{ publicId: payload.sub },
    });

    if (!user) {
      throw new NotFoundException('Provided auth user not found');
    }

    return {
      ...user,
    };
  }
}
