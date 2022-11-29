import { Test, TestingModule } from '@nestjs/testing';

import { mock } from 'jest-mock-extended';
import { Chance } from 'chance';

import { MessageService } from './message.service';
import { MessagesService } from '../../common/services';
import { CreateMessageDto } from '../dto';
import { messageMockFactory } from '../../../test/utils/entity-mocks';
import { Message } from '../../entities';

describe('MessageService', () => {
  let service: MessageService;
  let messagesServiceMock: jest.Mocked<MessagesService>;

  let chance: Chance.Chance;

  beforeEach(async () => {
    messagesServiceMock = mock<MessagesService>();

    chance = new Chance();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: MessagesService,
          useValue: messagesServiceMock,
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
  });

  describe('create method', () => {
    let contentMock: string;
    let channelIdMock: string;
    let memberIdMock: string;
    let messageIdToReplyMock: string;
    let createMessageDtoMock: CreateMessageDto;
    let expectedMessage: Message;

    beforeEach(() => {
      contentMock = chance.paragraph({ length: 20 });
      channelIdMock = chance.string({ length: 20 });
      memberIdMock = chance.string({ length: 20 });
      messageIdToReplyMock = chance.string({ length: 20 });
      createMessageDtoMock = {
        content: contentMock,
        channelId: channelIdMock,
        memberId: memberIdMock,
      };

      expectedMessage = messageMockFactory(chance);
      expectedMessage.channelId = channelIdMock;
      expectedMessage.memberId = memberIdMock;
      expectedMessage.content = contentMock;

      messagesServiceMock.save.mockImplementation(async (message: Message) => {
        return message;
      });
    });

    it('should return the created message without message id to reply', async () => {
      expectedMessage.messageIdToReply = undefined;

      const result: Message = await service.create(createMessageDtoMock);

      expect(result).toEqual(expectedMessage);
    });

    it('should return the created message with message id to reply', async () => {
      createMessageDtoMock.messageIdToReply = messageIdToReplyMock;
      expectedMessage.messageIdToReply = messageIdToReplyMock;

      const result: Message = await service.create(createMessageDtoMock);

      expect(result).toEqual(expectedMessage);
    });
  });
});
