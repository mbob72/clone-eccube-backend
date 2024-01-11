import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/createUser.dto';
import { UsersRepository } from './users.repository';
import { Nullable } from 'src/types/utils';
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
    if (updateUserDto.phoneNumber) {
      user.phoneNumber = updateUserDto.phoneNumber;
    }
    if (updateUserDto.address) {
      user.address = updateUserDto.address;
    }
    if (updateUserDto.company) {
      user.company = updateUserDto.company;
    }
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

  async updateRefreshToken(id: string, refreshToken: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    user.refreshToken = refreshToken;
    return this.usersRepository.save(user);
  }
  async removeRefreshToken(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    user.refreshToken = null;
    return this.usersRepository.save(user);
  }

  async setIsVerified(id: string, isVerified = false): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    user.isVerified = isVerified;
    return this.usersRepository.save(user);
  }

  async setIsActive(id: string, isActive = false): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    user.isActive = isActive;
    return this.usersRepository.save(user);
  }

  async saveMollieAccessToken(
    id: string,
    token: Nullable<string> = null,
  ): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    user.mollieAccessToken = token;
    return this.usersRepository.save(user);
  }

  async setOnboardingState(
    id: string,
    isOnboardingPassed = false,
  ): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    user.isOnboardingPassed = isOnboardingPassed;
    return this.usersRepository.save(user);
  }
}
