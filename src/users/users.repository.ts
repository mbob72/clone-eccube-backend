import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nullable } from 'src/types/utils';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }
  async findById(id: string): Promise<Nullable<User>> {
    return this.usersRepository.findOne({ where: { id } });
  }
  async findByEmail(email: string): Promise<Nullable<User>> {
    return this.usersRepository
      .createQueryBuilder()
      .where('email = LOWER(:email)', { email })
      .getOne();
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }
}
