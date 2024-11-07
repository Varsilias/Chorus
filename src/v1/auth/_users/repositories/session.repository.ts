import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { SessionEntity } from '../entities/session.entity';

@Injectable()
export class SessionRepository extends Repository<SessionEntity> {
  constructor(private datasource: DataSource) {
    super(SessionEntity, datasource.createEntityManager());
  }
}
