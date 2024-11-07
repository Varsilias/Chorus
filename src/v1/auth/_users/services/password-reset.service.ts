import { Injectable } from '@nestjs/common';
import { PasswordResetTokenRepository } from '../repositories/password-reset-token.repository';
import { PasswordResetTokenEntity } from '../entities/password-reset-token.entity';

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
  ) {}

  async createEntry(payload: Partial<PasswordResetTokenEntity>) {
    const entity = this.passwordResetTokenRepository.create(payload);
    const entry = await this.passwordResetTokenRepository.save(entity);
    return entry;
  }

  async updateEntry(
    criteria: Pick<PasswordResetTokenEntity, 'email'>,
    updatePayload: Partial<PasswordResetTokenEntity>,
  ) {
    const updateResult = await this.passwordResetTokenRepository.update(
      { ...criteria },
      { ...updatePayload },
    );
    return updateResult;
  }

  async deleteEntry(criteria: Partial<PasswordResetTokenEntity>) {
    return await this.passwordResetTokenRepository.delete({ ...criteria });
  }

  async findEntryBy(criteria: Partial<PasswordResetTokenEntity>) {
    const entry = await this.passwordResetTokenRepository.findOneBy({
      ...criteria,
    });
    return entry;
  }
}
