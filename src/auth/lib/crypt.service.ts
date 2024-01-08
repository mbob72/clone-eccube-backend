import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CryptService {
  constructor(private readonly configService: ConfigService) {}

  async generateHash(plain: string): Promise<string> {
    const salt = this.configService.get<string | number>('salt') || 10;
    return bcrypt.hash(plain, salt);
  }

  async verify(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }

  async generateSalt(): Promise<string> {
    const salt = await bcrypt.genSalt();
    return salt;
  }
}
