import { Injectable } from '@nestjs/common';
import { Nullable } from 'src/app/types/utils';
import { OrganizationsRepository } from './organizations.repository';
import { Organization } from './entities/organization.entity';
import { UsersService } from 'src/users/users.service';
import { CreateOrganizationDto } from './dto/createOrganization.dto';
import { UpdateOrganizationDto } from './dto/updateOrganization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly orgsRepository: OrganizationsRepository,
    private readonly usersService: UsersService,
  ) {}

  async findByEmail(email: string): Promise<Nullable<Organization>> {
    return this.orgsRepository.findByEmail(email);
  }

  async findById(id: string): Promise<Nullable<Organization>> {
    return this.orgsRepository.findById(id);
  }

  async getCurrent(userId: string): Promise<Nullable<Organization>> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    if (!user.organizationId) {
      throw new Error('User has no organization');
    }
    return this.orgsRepository.findById(user.organizationId);
  }

  async create(
    userId: string,
    createDto: CreateOrganizationDto,
  ): Promise<Organization> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    // TODO: add working check - now return first one
    // let organization = await this.orgsRepository.findByEmail(createDto.email);
    const organization = Organization.createByDto(createDto);
    Object.assign(organization, { representatives: [user] });
    const savedOrganization = await this.orgsRepository.save(organization);
    return savedOrganization;
  }

  async update(
    id: string,
    updateDto: UpdateOrganizationDto,
  ): Promise<Organization> {
    const organization = await this.orgsRepository.findById(id);
    if (!organization) {
      throw new Error('Organization not found');
    }
    if (updateDto.email && updateDto.email !== organization.email) {
      organization.email = updateDto.email;
    }
    if (updateDto.name) {
      organization.name = updateDto.name;
    }
    if (updateDto.website) {
      organization.website = updateDto.website;
    }
    if (updateDto.phone) {
      organization.phone = updateDto.phone;
    }
    if (updateDto.mode) {
      organization.mode = updateDto.mode;
    }
    if (updateDto.description) {
      organization.description = updateDto.description;
    }
    if (updateDto.countriesOfActivity) {
      organization.countriesOfActivity = updateDto.countriesOfActivity;
    }
    if (updateDto.businessCategory) {
      organization.businessCategory = updateDto.businessCategory;
    }
    const saved = await this.orgsRepository.save(organization);
    return saved;
  }
}
