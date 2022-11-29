import { Injectable } from '@nestjs/common';

import { CreateMessageDto, UpdateMessageDto } from '../dto';
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

  findAll() {
    return `This action returns all message`;
  }

  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
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
