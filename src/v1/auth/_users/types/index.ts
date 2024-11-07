import { UserEntity } from '../entities/user.entity';

export interface ISessionPayload {
  ip_address: string;
  last_activity: Date;
  user_agent: string;
  user: UserEntity;
  payload: string;
}
