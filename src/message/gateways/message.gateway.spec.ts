import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

import { Socket } from 'socket.io';
import { mock } from 'jest-mock-extended';
import { Chance } from 'chance';

import { MessageGateway } from './message.gateway';
import { MessageService } from '../services';
import { MembersService } from '../../common/services';
import { Member } from '../../entities';
import { memberMockFactory } from '../../../test/utils/entity-mocks';

describe('MessageGateway', () => {
  let gateway: MessageGateway;
  let messageServiceMock: jest.Mocked<MessageService>;
  let membersServiceMock: jest.Mocked<MembersService>;

  let chance: Chance.Chance;

  beforeEach(async () => {
    messageServiceMock = mock<MessageService>();
    membersServiceMock = mock<MembersService>();

    chance = new Chance();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageGateway, 
        MessageService,
        {
          provide: MessageService,
          useValue: messageServiceMock,
        },
        {
          provide: MembersService,
          useValue: membersServiceMock,
        },
      ],
    }).compile();

    gateway = module.get<MessageGateway>(MessageGateway);
  });

  describe('handleConnection method', () => {
    let socketMock: Socket;
    let userIdMock: string;

    beforeEach(() => {
      socketMock = mock<Socket>();
      userIdMock = chance.string({ length: 20 });
      socketMock.handshake.query = {
        userId: userIdMock,
      };

      membersServiceMock.getAllByUserId.mockReturnValue(
        (async () => [new Member()])(),
      );
    });

    it('should throw if no userId is provided', async () => {
      const expectedErrorMessage = 'Please provide a user id';
      socketMock.handshake.query = {};

      const execute = () => gateway.handleConnection(socketMock);

      await expect(execute).rejects.toThrowError(BadRequestException);
      await expect(execute).rejects.toThrow(expectedErrorMessage);
    });

    it('should throw if the user is an array of strings', async () => {
      const expectedErrorMessage =
        'The userId query parameter should be a string';
      socketMock.handshake.query = {
        userId: ['', ''],
      };

      const execute = () => gateway.handleConnection(socketMock);

      await expect(execute).rejects.toThrowError(BadRequestException);
      await expect(execute).rejects.toThrow(expectedErrorMessage);
    });

    it('should get members of the client', async () => {
      await gateway.handleConnection(socketMock);

      expect(membersServiceMock.getAllByUserId).toBeCalledTimes(1);
      expect(membersServiceMock.getAllByUserId).toBeCalledWith(userIdMock);
    });

    it('should join the client to all his channels rooms', async () => {
      const userMembersLength = 3;
      const userMembersMock: Member[] = new Array(userMembersLength)
        .fill(null)
        .map(() => memberMockFactory(chance));
      const expectedUserMembers: Member[] = userMembersMock.map(
        (member) => member,
      );
      membersServiceMock.getAllByUserId.mockReturnValue(
        (async () => userMembersMock)(),
      );

      await gateway.handleConnection(socketMock);

      expect(socketMock.join).toBeCalledTimes(userMembersLength);
      expectedUserMembers.forEach((userMember) =>
        expect(socketMock.join).toBeCalledWith(userMember.channelId),
      );
    });
  });
});
