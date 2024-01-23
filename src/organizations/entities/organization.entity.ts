import { v4 as uuidv4 } from 'uuid';
import { plainToClass } from 'class-transformer';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { CreateOrganizationDto } from '../dto/createOrganization.dto';

// most fields from here:
// https://docs.mollie.com/reference/v2/profiles-api/create-profile

// TODO: add more fields like `address`, `vatNumber` and etc.

@Entity('organization')
export class Organization {
  static createByDto(createDto: CreateOrganizationDto): Organization {
    const organization = plainToClass(Organization, createDto);
    organization.id = uuidv4();
    return organization;
  }

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public name: string;

  // The URL must be compliant to RFC3986 with the exception that
  // we only accept URLs with http:// or https:// schemes and
  // domains that contain a TLD. URLs containing an @are not allowed.
  @Column()
  public website: string;

  @Column()
  public email: string;

  // Must be in the E.164 format.
  // For example +31208202070
  @Column()
  public phone: string;

  @Column({ default: 'test' })
  public mode: string; // test | live

  /*
   * optional properties by Mollie
   */

  @Column({ default: '' })
  public description: string;

  @Column('text', { array: true, default: [] })
  public countriesOfActivity: string[];

  @Column({ default: '' })
  public businessCategory: string;

  @OneToMany(() => User, (user) => user.organization, {
    cascade: true,
    eager: true,
  })
  representatives: User[];

  // @Column({ default: null, nullable: true })
  // public vatNumber: string;

  @Column({ default: '' })
  public address: string;

  /*
   * auto-set properties
   */

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

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
}
