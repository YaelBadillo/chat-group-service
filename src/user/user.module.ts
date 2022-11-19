import { Module } from '@nestjs/common';

import { UserController } from './controllers';
import { UserService } from './services';
import { PasswordModule, SerializerModule } from '../shared';

@Module({
  imports: [PasswordModule, SerializerModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
