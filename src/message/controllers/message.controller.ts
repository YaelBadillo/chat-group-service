import { Controller, Body, Delete, HttpCode, HttpStatus } from '@nestjs/common';

import { DeleteMessageDto } from '../dto';
import { Member, Message } from '../../entities';
import { MessagesService } from '../../common/services';
import { MemberFromRequest, VerifyMember } from './../../common/decorators';
import { MessageGateway } from '../gateways';

@Controller('message')
export class MessageController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly messageGateway: MessageGateway,
  ) {}

  @Delete(':messageId/delete')
  @HttpCode(HttpStatus.OK)
  @VerifyMember()
  public async deleteMessage(
    @Body() { messageId }: DeleteMessageDto,
    @MemberFromRequest() { id: memberId, channelId }: Member,
  ): Promise<Message> {
    const message: Message = await this.messagesService.findOneByIdAndMemberId(
      messageId,
      memberId,
    );

    await this.messagesService.remove(message);

    this.messageGateway.notifyEachActiveClientOfARoom(
      channelId,
      'handleDeletedMessage',
      messageId,
    );

    return message;
  }
}
