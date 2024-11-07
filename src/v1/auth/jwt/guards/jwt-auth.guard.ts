import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    try {
      const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
        context.getHandler(),
        context.getClass(),
      ]);
      if (!!isPublic) {
        return true;
      }
      const authorizationRes = await super.canActivate(context);
      return !!authorizationRes;
    } catch (error) {
      this.logger.error(error?.message);
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException('Unauthorised');
      }

      throw new BadRequestException('Invalid token user or token mismatch');
    }
  }
}
