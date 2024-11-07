import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../../commons/entities/base.entity';
import { Exclude } from 'class-transformer';
import { SessionEntity } from './session.entity';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity<UserEntity> {
  @Column({ type: 'varchar' })
  firstname: string;

  @Column({ type: 'varchar' })
  lastname: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: false, name: 'is_admin' })
  isAdmin: boolean;

  @Column({ default: 'user', type: 'varchar' })
  role: string;

  @Column({ type: 'varchar' })
  @Exclude()
  password: string;

  @Column({ type: 'varchar' })
  @Exclude()
  salt: string;

  @Column({ default: false, name: 'email_verified' })
  emailVerified?: boolean;

  @Column({ type: 'timestamptz', nullable: true, name: 'email_verified_at' })
  emailVerifiedAt?: Date;

  @Column({ nullable: true, type: 'integer', name: 'security_token' })
  @Exclude()
  securityToken?: number;

  // When the user registered / requested email change
  @Column({
    type: 'timestamptz',
    nullable: true,
    name: 'security_token_requested_at',
  })
  @Exclude()
  securityTokenRequestedAt?: Date;

  @OneToMany(() => SessionEntity, (sessions) => sessions.user)
  sessions: SessionEntity[];
}
