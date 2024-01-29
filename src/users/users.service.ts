import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/createUser.dto';
import { UsersRepository } from './users.repository';
import { Nullable } from 'src/app/types/utils';
import { UpdateUserDto } from './dto/updateUser.dto';

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
      user.password = createDto.password;
    } else {
      user = User.createViaDto(createDto);
    }
    user.type = createDto.type;
    // user.restriction = this.getInitialRestriction();
    const savedUser = await this.usersRepository.save(user);
    return savedUser;
  }

  // can update only public fields
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      user.setEmail(updateUserDto.email);
      user.isVerified = false;
      // await this.confirmationService.sendConfirmationMail(user.id, originUrl);
    }
    if (updateUserDto.firstName) {
      user.firstName = updateUserDto.firstName;
    }
    if (updateUserDto.lastName) {
      user.lastName = updateUserDto.lastName;
    }
    if (updateUserDto.phone) {
      user.phone = updateUserDto.phone;
    }
    const savedUser = await this.usersRepository.save(user);
    return savedUser;
  }

  async save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  // Mollie
  async saveMollieProfileId(
    id: string,
    profileId: Nullable<string> = null,
  ): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    user.mollieProfileId = profileId;
    return this.usersRepository.save(user);
  }
}
