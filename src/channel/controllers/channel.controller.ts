import { Controller } from '@nestjs/common';
import { ChannelService } from '../services';

@Controller('channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}
}
