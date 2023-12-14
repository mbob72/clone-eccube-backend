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
    user.setEmail(createDto.email?.trim());
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
  public type: UserType;

  // user is activate via email
  @Column({ default: false })
  isActive: boolean;

  // user is verified via email
  // also if user change email -> it should set `false`
  // and send new confirm-email to verify again
  @Column({ default: false })
  public isVerified: boolean;

  @Column({ default: null })
  public mollieAccessToken: string;

  // next properties that should be set via onboarding

  @Column({ default: '' })
  public firstName: string;

  @Column({ default: '' })
  public lastName: string;

  @Column({ default: null })
  public phoneNumber: string;

  // TODO: should be object (city, street, etc)
  @Column({ default: null })
  public address: string;

  // TODO: should be object (name, iban, etc)
  @Column({ default: null })
  public company: string;

  // auto-set properties

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  // methods

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
