import { Injectable } from '@nestjs/common';

import { CreateMessageDto } from '../dto';
import { MessagesService } from '../../common/services';
import { Message } from '../../entities';

@Injectable()
export class MessageService {
  constructor(private readonly messagesService: MessagesService) {}

  public create(createMessageDto: CreateMessageDto): Promise<Message> {
    const messageInstance: Message =
      this.createMessageInstance(createMessageDto);

    return this.messagesService.save(messageInstance);
  }

  public async delete(id: string, memberId: string) {
    const message: Message = await this.messagesService.findOneByIdAndMemberId(
      id,
      memberId,
    );
    
    await this.messagesService.remove(message);
  }

  private createMessageInstance(createMessageDto: CreateMessageDto): Message {
    const messageInstance = new Message();
    messageInstance.memberId = createMessageDto.memberId;
    messageInstance.channelId = createMessageDto.channelId;
    messageInstance.content = createMessageDto.content;
    messageInstance.messageIdToReply = createMessageDto?.messageIdToReply;

    return messageInstance;
  }
}
