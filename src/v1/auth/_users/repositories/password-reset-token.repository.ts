import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PasswordResetTokenEntity } from '../entities/password-reset-token.entity';

@Injectable()
export class PasswordResetTokenRepository extends Repository<PasswordResetTokenEntity> {
  constructor(private datasource: DataSource) {
    super(PasswordResetTokenEntity, datasource.createEntityManager());
  }
}
