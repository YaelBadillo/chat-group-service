import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Message } from '../../../entities';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  public async save(message: Message): Promise<Message> {
    try {
      const newMessage: Message = await this.messageRepository.save(message);
      return newMessage;
    } catch (error) {
      throw new InternalServerErrorException(
        'Message could not be created or updated',
      );
    }
  }

  public async findOneByIdAndMemberId(id: string, memberId:string): Promise<Message> {
    try {
      const message: Message = await this.messageRepository.findOneBy({ id, memberId });
      return message;
    } catch (error) {
      throw new InternalServerErrorException('Message could not be found');
    }
  }

  public async remove(message: Message): Promise<Message> {
    try {
      await this.messageRepository.remove(message);
      return message;
    } catch (error) {
      throw new InternalServerErrorException('Message could not be removed');
    }
  }
}
