import { Injectable, InternalServerErrorException } from '@nestjs/common';

import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
  private readonly bcrypt = bcrypt;
  private readonly saltRounds = 12;

  public encrypt(password: string): Promise<string> {
    try {
      return this.bcrypt.hash(password, this.saltRounds);
    } catch (_) {
      throw new InternalServerErrorException('Password could not be encrypted');
    }
  }

  public compare(password: string, hashedPassword: string): Promise<boolean> {
    try {
      return this.bcrypt.compare(password, hashedPassword);
    } catch (_) {
      throw new InternalServerErrorException('Password could not be verified');
    }
  }
}
