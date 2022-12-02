import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

import { BroadcastOperator, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { mock } from 'jest-mock-extended';
import { Chance } from 'chance';

import { MemberGateway } from './member.gateway';
import { MemberService } from '../services';
import { UsersService } from '../../common/services';
import { Member, User } from '../../entities';
import { CreateInvitationsDto } from '../dto';
import { WsJwtAuthGuard } from '../../common/guard';
import {
  userMockFactory,
  memberMockFactory,
} from '../../../test/utils/entity-mocks';

describe('MemberGateway', () => {
  let gateway: MemberGateway;
  let memberServiceMock: jest.Mocked<MemberService>;
  let usersServiceMock: jest.Mocked<UsersService>;
  let wsJwtAuthGuardMock: jest.Mocked<WsJwtAuthGuard>;

  let chance: Chance.Chance;

  beforeEach(async () => {
    memberServiceMock = mock<MemberService>();
    usersServiceMock = mock<UsersService>();
    wsJwtAuthGuardMock = mock<WsJwtAuthGuard>();

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

  describe('createInvitations', () => {
    let userMock: User;
    let clientMock: jest.Mocked<Socket>;
    let broadCastOperatorMock: BroadcastOperator<DefaultEventsMap, any>;
    let createInvitationDtosLength: number;
    let channelIdMock: string;
    let userNameMocks: string[];
    let createInvitationsDtoMock: CreateInvitationsDto;

    beforeEach(() => {
      clientMock = mock<Socket>();
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
          'invitation',
          expectedInvitationString,
        );
      });
    });
  });
});
