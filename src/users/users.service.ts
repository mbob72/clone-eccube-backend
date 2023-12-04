import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nullable } from 'src/types/utils';
import { UserType } from './users.type';
import { CreateUserDto } from './dto/createUser.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  // REPOSITORY METHODS

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  // search by id

  findById(id: string): Promise<Nullable<User>> {
    return this.usersRepository.findOne({ where: { id } });
  }
  findSupplierById(id: string): Promise<Nullable<User>> {
    return this.usersRepository.findOne({
      where: { id, type: UserType.Supplier },
    });
  }
  findCustomerById(id: string): Promise<Nullable<User>> {
    return this.usersRepository.findOne({
      where: { id, type: UserType.Customer },
    });
  }

  // search by email

  findByEmail(email: string): Promise<Nullable<User>> {
    return this.usersRepository
      .createQueryBuilder()
      .where('email = LOWER(:email)', { email })
      .getOne();
  }
  findSupplierByEmail(email: string): Promise<Nullable<User>> {
    return this.usersRepository
      .createQueryBuilder()
      .where('email = LOWER(:email) and type = :type', {
        email,
        type: UserType.Supplier,
      })
      .getOne();
  }
  findCustomerByEmail(email: string): Promise<Nullable<User>> {
    return this.usersRepository
      .createQueryBuilder()
      .where('email = LOWER(:email) and type = :type', {
        email,
        type: UserType.Customer,
      })
      .getOne();
  }

  // SERVICE METHODS

  async create(createDto: CreateUserDto): Promise<User> {
    let user = await this.findByEmail(createDto.email);
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
    const savedUser = await this.save(user);
    return savedUser;
  }

  async updatePassword(id: string, hashedPassword: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    user.password = hashedPassword;
    return this.save(user);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  private async save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }
}
