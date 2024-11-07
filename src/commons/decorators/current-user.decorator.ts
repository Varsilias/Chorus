import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { UserEntity } from '../../v1/auth/_users/entities/user.entity';

export type IDecoratorUser = UserEntity;
export const extractUser = (request: any): IDecoratorUser => request['user'];

export const CurrentUser = createParamDecorator(
  (data: any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    console.log(request);
    return data ? extractUser(request)[data] : extractUser(request);
  },
);
