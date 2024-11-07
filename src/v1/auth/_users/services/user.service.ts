import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { UserEntity } from '../entities/user.entity';
import { DeepPartial } from 'typeorm';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findUserBy(criteria: Partial<UserEntity>) {
    const user = await this.userRepository.findOneBy({ ...criteria });
    return user;
  }

  async updateUser(publicId: string, criteria: Partial<UserEntity>) {
    const user = await this.userRepository.update(
      { publicId },
      { ...criteria },
    );
    return user;
  }

  async createUser(payload: DeepPartial<UserEntity> & { salt: string }) {
    const entity = this.userRepository.create(payload);
    const user = this.userRepository.save(entity);
    return user;
  }
}
