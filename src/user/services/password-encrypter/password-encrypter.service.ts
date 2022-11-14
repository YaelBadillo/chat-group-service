import { Injectable } from '@nestjs/common';

import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordEncrypterService {
  private readonly bcrypt = bcrypt;
  private readonly saltRounds = 12;

  public encrypt(password: string): Promise<string> {
    return this.bcrypt.hash(password, this.saltRounds);
  }

  public decrypt(password: string, hashedPassword: string): Promise<boolean> {
    return this.bcrypt.compare(password, hashedPassword);
  }
}
