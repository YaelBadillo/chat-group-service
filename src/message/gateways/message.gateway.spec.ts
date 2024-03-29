import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

import { BroadcastOperator, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { mock } from 'jest-mock-extended';
import { Chance } from 'chance';

import { MessageGateway } from './message.gateway';
import { MessageService } from '../services';
import { MembersService } from '../../common/services';
import { Member, Message } from '../../entities';
import {
  memberMockFactory,
  messageMockFactory,
} from '../../../test/utils/entity-mocks';
import { CreateMessageDto } from '../dto';
import { WsJwtAuthGuard } from '../../common/guard';

describe('MessageGateway', () => {
  let gateway: MessageGateway;
  let messageServiceMock: jest.Mocked<MessageService>;
  let membersServiceMock: jest.Mocked<MembersService>;
  let wsJwtAuthGuardMock: jest.Mocked<WsJwtAuthGuard>;

  let chance: Chance.Chance;

  beforeEach(async () => {
    messageServiceMock = mock<MessageService>();
    membersServiceMock = mock<MembersService>();
    wsJwtAuthGuardMock = mock<WsJwtAuthGuard>();

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
    })
      .overrideGuard(WsJwtAuthGuard)
      .useValue(wsJwtAuthGuardMock)
      .compile();

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

  describe('create method', () => {
    let contentMock: string;
    let channelIdMock: string;
    let memberIdMock: string;
    let messageIdToReplyMock: string;
    let createMessageDtoMock: CreateMessageDto;
    let clientMock: jest.Mocked<Socket>;
    let broadCastOperatorMock: BroadcastOperator<DefaultEventsMap, any>;

    beforeEach(() => {
      contentMock = chance.paragraph({ length: 20 });
      channelIdMock = chance.string({ length: 20 });
      memberIdMock = chance.string({ length: 20 });
      messageIdToReplyMock = chance.string({ length: 20 });
      createMessageDtoMock = {
        content: contentMock,
        channelId: channelIdMock,
        memberId: memberIdMock,
        messageIdToReply: messageIdToReplyMock,
      };
      clientMock = mock<Socket>();
      broadCastOperatorMock = mock<BroadcastOperator<DefaultEventsMap, any>>();
      clientMock.to.mockReturnValue(broadCastOperatorMock);
    });

    it('should create the message', async () => {
      const expectedArgument: CreateMessageDto = { ...createMessageDtoMock };

      await gateway.create(createMessageDtoMock, clientMock);

      expect(messageServiceMock.create).toBeCalledTimes(1);
      expect(messageServiceMock.create).toBeCalledWith(expectedArgument);
    });

    it('should emit the message to the other members', async () => {
      const messageMock: Message = messageMockFactory(chance);
      const expectedChannelId: string = channelIdMock;
      const expectedMessageString: string = JSON.stringify(messageMock);
      messageServiceMock.create.mockReturnValue((async () => messageMock)());

      await gateway.create(createMessageDtoMock, clientMock);

      expect(clientMock.to).toBeCalledTimes(1);
      expect(clientMock.to).toBeCalledWith(expectedChannelId);
      expect(broadCastOperatorMock.emit).toBeCalledTimes(1);
      expect(broadCastOperatorMock.emit).toBeCalledWith(expectedMessageString);
    });
  });
});
