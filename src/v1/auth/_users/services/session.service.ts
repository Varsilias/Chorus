import { Injectable } from '@nestjs/common';
import { SessionRepository } from '../repositories/session.repository';
import { ISessionPayload } from '../types';

@Injectable()
export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async createSessionEntry(session: ISessionPayload) {
    const entity = this.sessionRepository.create(session);
    const sessionEntry = await this.sessionRepository.save(entity);
    return sessionEntry;
  }
}
