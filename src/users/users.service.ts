import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/createUser.dto';
import { UsersRepository } from './users.repository';
import { Nullable } from 'src/types/utils';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findByEmail(email: string): Promise<Nullable<User>> {
    return this.usersRepository.findByEmail(email);
  }

  async findById(id: string): Promise<Nullable<User>> {
    return this.usersRepository.findById(id);
  }

  async create(createDto: CreateUserDto): Promise<User> {
    let user = await this.usersRepository.findByEmail(createDto.email);
    if (user) {
      user.firstName = createDto.firstName;
      user.lastName = createDto.lastName;
      user.password = createDto.password;
    } else {
      user = User.createViaDto(createDto);
    }
    user.type = createDto.type;
    // user.activate();
    user.isVerified = !!createDto.isVerified;
    // user.restriction = this.getInitialVendorRestriction();
    const savedUser = await this.usersRepository.save(user);
    return savedUser;
  }

  async updatePassword(id: string, hashedPassword: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    user.password = hashedPassword;
    return this.usersRepository.save(user);
  }
}
