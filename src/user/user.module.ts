import { Module } from '@nestjs/common';

import { UserController } from './controllers';
import { UserService } from './services';
import { PasswordModule } from '../shared';

@Module({
  imports: [PasswordModule],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}
