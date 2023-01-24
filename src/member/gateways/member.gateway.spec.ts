import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

import { BroadcastOperator, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { mock } from 'jest-mock-extended';
import { Chance } from 'chance';

import { MemberGateway } from './member.gateway';
import { MemberService } from '../services';
import { UsersService } from '../../common/services';
import { Channel, Member, User } from '../../entities';
import { CreateInvitationsDto, CreateRequestToJoinDto } from '../dto';
import { WsJwtAuthGuard, ChannelOwnerGuard } from '../../common/guard';
import { SocketWithUser, SocketWithUserAndChannel } from '../../common/types';
import { AttachChannelInterceptor } from '../../common/interceptors';
import {
  userMockFactory,
  memberMockFactory,
  channelMockFactory,
} from '../../../test/utils/entity-mocks';

describe('MemberGateway', () => {
  let gateway: MemberGateway;
  let memberServiceMock: jest.Mocked<MemberService>;
  let usersServiceMock: jest.Mocked<UsersService>;
  let wsJwtAuthGuardMock: jest.Mocked<WsJwtAuthGuard>;
  let channelOwnerGuardMock: jest.Mocked<ChannelOwnerGuard>;
  let attachChannelInterceptorMock: jest.Mocked<AttachChannelInterceptor>;

  let chance: Chance.Chance;

  beforeEach(async () => {
    memberServiceMock = mock<MemberService>();
    usersServiceMock = mock<UsersService>();
    wsJwtAuthGuardMock = mock<WsJwtAuthGuard>();
    channelOwnerGuardMock = mock<ChannelOwnerGuard>();
    attachChannelInterceptorMock = mock<AttachChannelInterceptor>();

    chance = new Chance();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemberGateway,
        {
          provide: MemberService,
          useValue: memberServiceMock,
        },
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    })
      .overrideGuard(WsJwtAuthGuard)
      .useValue(wsJwtAuthGuardMock)
      .overrideGuard(ChannelOwnerGuard)
      .useValue(channelOwnerGuardMock)
      .overrideInterceptor(AttachChannelInterceptor)
      .useValue(attachChannelInterceptorMock)
      .compile();

    gateway = module.get<MemberGateway>(MemberGateway);
  });

  describe('handleConnection method', () => {
    let userIdMock: string;
    let clientMock: Socket;

    beforeEach(() => {
      userIdMock = chance.string({ length: 20 });
      clientMock = mock<Socket>();

      clientMock.handshake.query = {
        userId: userIdMock,
      };

      usersServiceMock.findOneById.mockReturnValue((async () => new User())());
    });

    it('should throw if no user id is provided', async () => {
      const expectedErrorMessage = 'Please provide a user id';
      clientMock.handshake.query = {};

      const execute = () => gateway.handleConnection(clientMock);

      await expect(execute).rejects.toThrowError(BadRequestException);
      await expect(execute).rejects.toThrow(expectedErrorMessage);
    });

    it('should throw if the user id is an array of strings', async () => {
      const expectedErrorMessage =
        'The userId query parameter should be a string';
      clientMock.handshake.query = {
        userId: ['', ''],
      };

      const execute = () => gateway.handleConnection(clientMock);

      await expect(execute).rejects.toThrowError(BadRequestException);
      await expect(execute).rejects.toThrow(expectedErrorMessage);
    });

    it('should throw if user is not found', async () => {
      const expectedErrorMessage = `There is no user with the user id ${userIdMock}`;
      usersServiceMock.findOneById.mockReturnValue((async () => null)());

      const execute = () => gateway.handleConnection(clientMock);

      await expect(execute).rejects.toThrowError(BadRequestException);
      await expect(execute).rejects.toThrow(expectedErrorMessage);
    });

    it('should join user to the room using his user id', async () => {
      await gateway.handleConnection(clientMock);

      expect(clientMock.join).toBeCalledTimes(1);
      expect(clientMock.join).toBeCalledWith(userIdMock);
    });
  });

  describe('createInvitations method', () => {
    let userMock: User;
    let clientMock: jest.Mocked<SocketWithUser>;
    let broadCastOperatorMock: BroadcastOperator<DefaultEventsMap, any>;
    let createInvitationDtosLength: number;
    let channelIdMock: string;
    let userNameMocks: string[];
    let createInvitationsDtoMock: CreateInvitationsDto;

    beforeEach(() => {
      clientMock = mock<SocketWithUser>();
      userMock = userMockFactory(chance);
      clientMock.data.user = userMock;
      broadCastOperatorMock = mock<BroadcastOperator<DefaultEventsMap, any>>();
      clientMock.to.mockReturnValue(broadCastOperatorMock);
      createInvitationDtosLength = 3;
      channelIdMock = chance.string({ length: 20 });
      userNameMocks = new Array(createInvitationDtosLength)
        .fill(null)
        .map(() => chance.name());
      createInvitationsDtoMock = {
        channelId: channelIdMock,
        userNames: userNameMocks,
      };

      memberServiceMock.createInvitations.mockReturnValue(
        (async () => [new Member()])(),
      );
    });

    it('should create all invitations', async () => {
      const expectedCreateInvitationsDto: CreateInvitationsDto = {
        channelId: channelIdMock,
        userNames: null,
      };
      expectedCreateInvitationsDto.userNames = userNameMocks.map(
        (userNameMock) => userNameMock,
      );

      await gateway.createInvitations(clientMock, createInvitationsDtoMock);

      expect(memberServiceMock.createInvitations).toBeCalledTimes(1);
      expect(memberServiceMock.createInvitations).toBeCalledWith(
        userMock.id,
        expectedCreateInvitationsDto,
      );
    });

    it('should emit invitation to the respective active websocket clients', async () => {
      const invitationsMock: Member[] = userNameMocks.map(() => {
        const newInvitation = memberMockFactory(chance);
        newInvitation.userId = chance.string({ length: 20 });
        newInvitation.channelId = channelIdMock;
        newInvitation.createdBy = userMock.id;
        newInvitation.updatedBy = userMock.id;

        return newInvitation;
      });
      const expectedEvent: string = 'handleInvitation';
      const expectedInvitations: Member[] = invitationsMock.map(
        (invitationMock) => invitationMock,
      );
      memberServiceMock.createInvitations.mockReturnValue(
        (async () => invitationsMock)(),
      );

      await gateway.createInvitations(clientMock, createInvitationsDtoMock);

      expect(clientMock.to).toBeCalledTimes(createInvitationDtosLength);
      expect(broadCastOperatorMock.emit).toBeCalledTimes(
        createInvitationDtosLength,
      );
      expectedInvitations.forEach((expectedInvitation) => {
        const expectedInvitationString: string =
          JSON.stringify(expectedInvitation);

        expect(clientMock.to).toBeCalledWith(expectedInvitation.userId);
        expect(broadCastOperatorMock.emit).toBeCalledWith(
          expectedEvent,
          expectedInvitationString,
        );
      });
    });
  });

  describe('createRequestToJoin method', () => {
    let userMock: User;
    let channelMock: Channel;
    let clientMock: jest.Mocked<SocketWithUserAndChannel>;
    let channelIdMock: string;
    let createRequestToJoinDtoMock: jest.Mocked<CreateRequestToJoinDto>;
    let broadCastOperatorMock: BroadcastOperator<DefaultEventsMap, any>;

    beforeEach(() => {
      userMock = userMockFactory(chance);
      channelMock = channelMockFactory(chance);
      clientMock = mock<SocketWithUserAndChannel>();
      clientMock.user = userMock;
      clientMock.channel = channelMock;
      channelIdMock = chance.string({ length: 20 });
      createRequestToJoinDtoMock = {
        channelId: channelIdMock,
      };
      broadCastOperatorMock = mock<BroadcastOperator<DefaultEventsMap, any>>();

      clientMock.to.mockReturnValue(broadCastOperatorMock);
    });

    it('should emit request to join to the channel owner', async () => {
      const requestToJoinMock: Member = memberMockFactory(chance);
      const expectedEvent: string = 'handleRequestToJoin';
      const expectedRequestToJoin: Member = { ...requestToJoinMock };
      memberServiceMock.createRequestToJoin.mockReturnValue(
        (async () => requestToJoinMock)(),
      );

      await gateway.createRequestToJoin(clientMock, createRequestToJoinDtoMock);

      expect(clientMock.to).toBeCalledTimes(1);
      expect(clientMock.to).toBeCalledWith(channelMock.ownerId);
      expect(broadCastOperatorMock.emit).toBeCalledTimes(1);
      expect(broadCastOperatorMock.emit).toBeCalledWith(
        expectedEvent,
        expectedRequestToJoin,
      );
    });
  });
});
