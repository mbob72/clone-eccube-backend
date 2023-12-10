import { v4 as uuidv4 } from 'uuid';
import { Exclude, plainToClass } from 'class-transformer';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserType } from '../users.type';
import { CreateUserDto } from '../dto/createUser.dto';

@Entity('user')
export class User {
  static createViaDto(createDto: CreateUserDto): User {
    const user = plainToClass(User, createDto);
    user.id = uuidv4();
    // TODO: sanitize data before saving
    user.setEmail(createDto.email);
    user.firstName = createDto.firstName;
    user.lastName = createDto.lastName;
    return user;
  }

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  // skip when create from plain object
  @Exclude({ toClassOnly: true })
  @Column()
  public email: string;

  @Column()
  public password: string;

  @Column()
  public firstName: string;

  @Column()
  public lastName: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  public isVerified: boolean;

  @Column({ default: null })
  public mollieAccessToken: string;

  @Column()
  public type: UserType;

  // @Column()
  // public phoneNumber: string;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  // @Column()
  // public registeredAt: Date;

  public getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  public setEmail(email: string): void {
    this.email = email.toLowerCase().trim();
  }

  @BeforeInsert()
  protected setCreateDate(): void {
    this.createdAt = new Date();
  }

  @BeforeUpdate()
  protected setUpdateDate(): void {
    this.updatedAt = new Date();
  }
}
