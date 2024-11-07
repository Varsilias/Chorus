import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../../commons/entities/base.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'sessions ' })
export class SessionEntity extends BaseEntity<SessionEntity> {
  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_address: string | null;

  @Column({ type: 'text', nullable: true })
  user_agent: string | null;

  @Column({ type: 'json' })
  payload: string;

  @Column({ type: 'timestamptz', nullable: true })
  @Index()
  last_activity: Date;

  @ManyToOne(() => UserEntity, (user) => user.sessions)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
