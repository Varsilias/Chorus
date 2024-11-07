import { BaseEntity } from '../../../../commons/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'password_reset_tokens' })
export class PasswordResetTokenEntity extends BaseEntity<PasswordResetTokenEntity> {
  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  token: string;
}
