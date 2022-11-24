import { Module } from '@nestjs/common';

import { MessageService } from './services';
import { MessageController } from './controllers';

@Module({
  controllers: [MessageController],
  providers: [MessageService]
})
export class MessageModule {}
