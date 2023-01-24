import { Test, TestingModule } from '@nestjs/testing';

import { Chance } from 'chance';
import { mock } from 'jest-mock-extended';

import { CreateInvitationsDto } from '../dto';
import { MemberService } from './member.service';
import { MembersService, UsersService } from '../../common/services';
import { Member, User } from '../../entities';
import {
  InvitationStatus,
  MemberRole,
  RequestStatus,
} from '../../common/enums';
import { memberMockFactory } from '../../../test/utils/entity-mocks';

describe('MemberService', () => {
  let service: MemberService;
  let usersServiceMock: jest.Mocked<UsersService>;
  let membersServiceMock: jest.Mocked<MembersService>;

  let chance: Chance.Chance;

  beforeEach(async () => {
    usersServiceMock = mock<UsersService>();
    membersServiceMock = mock<MembersService>();

    chance = new Chance();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemberService,
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: MembersService,
          useValue: membersServiceMock,
        },
      ],
    }).compile();

    service = module.get<MemberService>(MemberService);

    usersServiceMock.findOneByName.mockReturnValue((async () => new User())());
  });

  describe('createInvitations method', () => {
    let createdByMock: string;
    let invitationsLength: number;
    let channelIdMock: string;
    let userNameMocks: string[];
    let createInvitationsDtoMock: CreateInvitationsDto;

    beforeEach(() => {
      createdByMock = chance.string({ length: 20 });
      invitationsLength = 3;
      channelIdMock = chance.string({ length: 20 });
      userNameMocks = new Array(invitationsLength)
        .fill(null)
        .map(() => chance.name());
      createInvitationsDtoMock = {
        channelId: channelIdMock,
        userNames: userNameMocks,
      };
    });

    it('should find the user with the name in the created invitation dto', async () => {
      const expectedUserNames: string[] = userNameMocks.map(
        (userNameMock) => userNameMock,
      );

      await service.createInvitations(createdByMock, createInvitationsDtoMock);

      expect(usersServiceMock.findOneByName).toBeCalledTimes(invitationsLength);
      expectedUserNames.forEach((expectedUserName) => {
        expect(usersServiceMock.findOneByName).toBeCalledWith(expectedUserName);
      });
    });

    it('should create invitations', async () => {
      const expectedInvitationInstances: Member[] = userNameMocks.map(() => {
        const newInvitation = new Member();
        newInvitation.channelId = channelIdMock;
        newInvitation.role = MemberRole.MEMBER;
        newInvitation.channelId = channelIdMock;
        newInvitation.invitationStatus = InvitationStatus.SENDED;
        newInvitation.requestStatus = RequestStatus.ACCEPTED;
        newInvitation.deleted = false;
        newInvitation.createdBy = createdByMock;
        newInvitation.updatedBy = createdByMock;

        return newInvitation;
      });

      await service.createInvitations(createdByMock, createInvitationsDtoMock);

      expect(membersServiceMock.save).toBeCalledTimes(invitationsLength);
      expectedInvitationInstances.forEach((expectedInvitationInstance) => {
        expect(membersServiceMock.save).toBeCalledWith(
          expectedInvitationInstance,
        );
      });
    });

    it('should return the created invitations', async () => {
      const expectedInvitations: Member[] = userNameMocks.map(() => {
        const newInvitation = new Member();
        newInvitation.channelId = channelIdMock;
        newInvitation.role = MemberRole.MEMBER;
        newInvitation.channelId = channelIdMock;
        newInvitation.invitationStatus = InvitationStatus.SENDED;
        newInvitation.requestStatus = RequestStatus.ACCEPTED;
        newInvitation.deleted = false;
        newInvitation.createdBy = createdByMock;
        newInvitation.updatedBy = createdByMock;

        return newInvitation;
      });
      membersServiceMock.save.mockImplementation(async (member: Member) => {
        return member;
      });

      const result: Member[] = await service.createInvitations(
        createdByMock,
        createInvitationsDtoMock,
      );

      expect(result).toEqual(expectedInvitations);
    });

    it('should return all valid members', async () => {
      const expectedInvitations: Member[] = userNameMocks
        .map((userNameMock) => {
          if (userNameMock === userNameMocks[1]) return null;
          const newInvitation = new Member();
          newInvitation.channelId = channelIdMock;
          newInvitation.role = MemberRole.MEMBER;
          newInvitation.channelId = channelIdMock;
          newInvitation.invitationStatus = InvitationStatus.SENDED;
          newInvitation.requestStatus = RequestStatus.ACCEPTED;
          newInvitation.deleted = false;
          newInvitation.createdBy = createdByMock;
          newInvitation.updatedBy = createdByMock;

          return newInvitation;
        })
        .filter((expectedInvitation) => expectedInvitation);
      usersServiceMock.findOneByName.mockImplementation(
        async (name: string) => {
          if (name === userNameMocks[1]) return null;

          return new User();
        },
      );
      membersServiceMock.save.mockImplementation(async (member: Member) => {
        return member;
      });

      const result: Member[] = await service.createInvitations(
        createdByMock,
        createInvitationsDtoMock,
      );

      expect(result).toEqual(expectedInvitations);
    });
  });

  describe('createRequestToJoin method', () => {
    let channelIdMock: string;
    let userIdMock: string;

    beforeEach(() => {
      channelIdMock = chance.string({ length: 20 });
      userIdMock = chance.string({ length: 20 });
    });

    it('should return the created request to join', async () => {
      const requestToJoinMock: Member = memberMockFactory(chance);
      requestToJoinMock.userId = userIdMock;
      requestToJoinMock.channelId = channelIdMock;
      requestToJoinMock.role = MemberRole.MEMBER;
      requestToJoinMock.invitationStatus = InvitationStatus.ACCEPTED;
      requestToJoinMock.requestStatus = RequestStatus.SENDED;
      requestToJoinMock.createdBy = userIdMock;
      requestToJoinMock.updatedBy = userIdMock;
      const expectedRequestToJoin: Member = { ...requestToJoinMock };
      membersServiceMock.save.mockReturnValue(
        (async () => requestToJoinMock)(),
      );

      const result: Member = await service.createRequestToJoin(channelIdMock, userIdMock);

      expect(result).toEqual(expectedRequestToJoin);
    });
  });
});
