import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { Chance } from 'chance';
import { mock } from 'jest-mock-extended';

import { MessagesService } from './messages.service';
import { Message } from '../../../entities';
import { messageMockFactory } from '../../../../test/utils/entity-mocks';
import { InternalServerErrorException } from '@nestjs/common';

describe('MessagesService', () => {
  let service: MessagesService;
  let messageRepositoryMock: jest.Mocked<Repository<Message>>;

  let chance: Chance.Chance;

  beforeEach(async () => {
    messageRepositoryMock = mock<Repository<Message>>();

    chance = new Chance();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: getRepositoryToken(Message),
          useValue: messageRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
  });

  describe('save method', () => {
    let messageMock: Message;

    beforeEach(() => {
      messageMock = messageMockFactory(chance);
    });

    it('should create/updated message', async () => {
      const expectedMessage: Message = { ...messageMock };

      await service.save(messageMock);

      expect(messageRepositoryMock.save).toBeCalledTimes(1);
      expect(messageRepositoryMock.save).toBeCalledWith(expectedMessage);
    });

    it('should return the created/updated message', async () => {
      const expectedMessage: Message = { ...messageMock };
      messageRepositoryMock.save.mockReturnValue((async () => messageMock)());

      const result: Message = await service.save(messageMock);

      expect(result).toEqual(expectedMessage);
    });

    it('should throw if the message could not be created or updated', async () => {
      const expectedMessageError = 'Message could not be created or updated';
      messageRepositoryMock.save.mockImplementation(async () => {
        throw new Error();
      });

      const execute = () => service.save(messageMock);

      await expect(execute).rejects.toThrowError(InternalServerErrorException);
      await expect(execute).rejects.toThrow(expectedMessageError);
    });
  });
});
