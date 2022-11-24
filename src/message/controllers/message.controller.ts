import { Controller } from '@nestjs/common';

import { MessageService } from '../services';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}
}
