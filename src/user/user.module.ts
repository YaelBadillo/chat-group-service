import { Module } from '@nestjs/common';

import { UserController } from './user.controller';
import { UserService, PasswordEncrypterService } from './services';

@Module({
  controllers: [UserController],
  providers: [UserService, PasswordEncrypterService],
})
export class UserModule {}
