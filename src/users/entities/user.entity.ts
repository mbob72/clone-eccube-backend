import { v4 as uuidv4 } from 'uuid';
import { Exclude, plainToClass } from 'class-transformer';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserType } from '../users.type';
import { CreateUserDto } from '../dto/createUser.dto';
import { Nullable } from 'src/types/utils';
import { Organization } from 'src/organizations/entities/organization.entity';

// TODO: move to separate file
// TODO: update next time
export type Address = {
  country: string; // Germany by default
  city: string;
  line: string; // street + apartment - free text (next time: google maps autocomplete input)
  additional: string; // additional info - optional free text
  zip: string;
};

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

  @Exclude({ toPlainOnly: true })
  @Column()
  public password: string;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'varchar', nullable: true, default: null })
  public refreshToken: Nullable<string>;

  @Column({
    type: 'enum',
    enum: UserType,
  })
  public type: UserType;

  // user is verified via email
  // also if user change email -> it should set `false`
  // and send new confirm-email to verify again
  @Column({ default: false })
  public isVerified: boolean;

  @Column({ default: false })
  public isOnboardingPassed: boolean;

  // user is activate when:
  // successfully pass onboarding
  // has Mollie token
  // ~wait 24h after that (Mollie need time to activate account)
  @Column({ default: false })
  public isActive: boolean;

  // next properties that should be set via onboarding

  @Column({ default: '' })
  public firstName: string;

  @Column({ default: '' })
  public lastName: string;

  @Column({ default: '' })
  public phone: string;

  @ManyToOne(() => Organization, (organization) => organization, {
    orphanedRowAction: 'delete',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  organization: Organization;

  /*
   * Mollie
   */

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'varchar', nullable: true, default: null })
  public mollieAccessToken: Nullable<string>;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'varchar', nullable: true, default: null })
  public mollieRefreshToken: Nullable<string>;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'date', nullable: true, default: null })
  public mollieAccessTokenExpiresAt: Nullable<string>;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'varchar', nullable: true, default: null })
  public mollieProfileId: Nullable<string>;

  /*
   * auto-set properties
   */

  @Column({ type: 'varchar', default: null })
  public organizationId: Nullable<string>;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  /*
   * methods
   */

  public getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  public setEmail(email: string): void {
    this.email = email.toLowerCase().trim();
  }

  /*
   * hooks
   */

  @BeforeInsert()
  protected setCreateDate(): void {
    this.createdAt = new Date();
  }

  @BeforeUpdate()
  protected setUpdateDate(): void {
    this.updatedAt = new Date();
  }

  // TODO: add 24h delay next time
  @BeforeUpdate()
  protected setIsActive(): void {
    this.isActive = this.isOnboardingPassed && !!this.mollieAccessToken;
  }
}
