import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nullable } from 'src/types/utils';
import { Organization } from './entities/organization.entity';

@Injectable()
export class OrganizationsRepository {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationsRepository: Repository<Organization>,
  ) {}

  async findAll(): Promise<Organization[]> {
    return this.organizationsRepository.find();
  }
  async findById(id: string): Promise<Nullable<Organization>> {
    return this.organizationsRepository.findOne({ where: { id } });
  }
  async findByEmail(email: string): Promise<Nullable<Organization>> {
    return this.organizationsRepository
      .createQueryBuilder()
      .where('email = LOWER(:email)', { email })
      .getOne();
  }

  async remove(id: string): Promise<void> {
    await this.organizationsRepository.delete(id);
  }

  async save(organization: Organization): Promise<Organization> {
    return this.organizationsRepository.save(organization);
  }
}
