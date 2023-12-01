import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

@Injectable()
export class CryptService {
  async generateHash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, SALT_ROUNDS);
  }

  async verify(plainPass: string, hashedPass: string): Promise<boolean> {
    return bcrypt.compare(plainPass, hashedPass);
  }
}
