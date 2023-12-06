import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CryptService {
  constructor(private readonly configService: ConfigService) {}

  async generateHash(plainPassword: string): Promise<string> {
    const salt = this.configService.get<string | number>('salt')!;
    return bcrypt.hash(plainPassword, salt);
  }

  async verify(plainPass: string, hashedPass: string): Promise<boolean> {
    return bcrypt.compare(plainPass, hashedPass);
  }

  async generateSalt(): Promise<string> {
    const salt = await bcrypt.genSalt();
    return salt;
  }
}
