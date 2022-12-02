import { Test, TestingModule } from '@nestjs/testing';

import { Chance } from 'chance';
import { mock } from 'jest-mock-extended';

import { CreateInvitationDto } from '../dto';
import { MemberService } from './member.service';
import { MembersService, UsersService } from '../../common/services';
import { Member, User } from '../../entities';
import {
  InvitationStatus,
  MemberRole,
  RequestStatus,
} from '../../common/enums';

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

  describe('createInvitations', () => {
    let createdByMock: string;
    let invitationsLength: number;
    let createInvitationDtoMocks: CreateInvitationDto[];

    beforeEach(() => {
      createdByMock = chance.string({ length: 20 });
      invitationsLength = 3;
      createInvitationDtoMocks = new Array(invitationsLength)
        .fill(null)
        .map(() => ({
          userName: chance.name(),
          channelId: chance.string({ length: 20 }),
        }));
    });

    it('should find the user with the name in the created invitation dto', async () => {
      await service.createInvitations(createdByMock, createInvitationDtoMocks);

      expect(usersServiceMock.findOneByName).toBeCalledTimes(invitationsLength);
      createInvitationDtoMocks.forEach((createInvitationDtoMock) => {
        expect(usersServiceMock.findOneByName).toBeCalledWith(
          createInvitationDtoMock.userName,
        );
      });
    });

    it('should create invitations', async () => {
      const expectedInvitationInstances: Member[] =
        createInvitationDtoMocks.map((createInvitationDtoMock) => {
          const newInvitation = new Member();
          newInvitation.channelId = createInvitationDtoMock.channelId;
          newInvitation.role = MemberRole.MEMBER;
          newInvitation.channelId = createInvitationDtoMock.channelId;
          newInvitation.invitationStatus = InvitationStatus.SENDED;
          newInvitation.requestStatus = RequestStatus.ACCEPTED;
          newInvitation.deleted = false;
          newInvitation.createdBy = createdByMock;
          newInvitation.updatedBy = createdByMock;

          return newInvitation;
        });

      await service.createInvitations(createdByMock, createInvitationDtoMocks);

      expect(membersServiceMock.save).toBeCalledTimes(invitationsLength);
      expectedInvitationInstances.forEach((expectedInvitationInstance) => {
        expect(membersServiceMock.save).toBeCalledWith(
          expectedInvitationInstance,
        );
      });
    });

    it('should return the created invitations', async () => {
      const expectedInvitations: Member[] = createInvitationDtoMocks.map(
        (createInvitationDtoMock) => {
          const newInvitation = new Member();
          newInvitation.channelId = createInvitationDtoMock.channelId;
          newInvitation.role = MemberRole.MEMBER;
          newInvitation.channelId = createInvitationDtoMock.channelId;
          newInvitation.invitationStatus = InvitationStatus.SENDED;
          newInvitation.requestStatus = RequestStatus.ACCEPTED;
          newInvitation.deleted = false;
          newInvitation.createdBy = createdByMock;
          newInvitation.updatedBy = createdByMock;

          return newInvitation;
        },
      );
      membersServiceMock.save.mockImplementation(async (member: Member) => {
        return member;
      });

      const result: Member[] = await service.createInvitations(
        createdByMock,
        createInvitationDtoMocks,
      );

      expect(result).toEqual(expectedInvitations);
    });

    it('should return all valid members', async () => {
      const expectedInvitations: Member[] = createInvitationDtoMocks
        .map((createInvitationDtoMock) => {
          if (
            createInvitationDtoMock.userName ===
            createInvitationDtoMocks[1].userName
          )
            return null;
          const newInvitation = new Member();
          newInvitation.channelId = createInvitationDtoMock.channelId;
          newInvitation.role = MemberRole.MEMBER;
          newInvitation.channelId = createInvitationDtoMock.channelId;
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
          if (name === createInvitationDtoMocks[1].userName) return null;

          return new User();
        },
      );
      membersServiceMock.save.mockImplementation(async (member: Member) => {
        return member;
      });

      const result: Member[] = await service.createInvitations(
        createdByMock,
        createInvitationDtoMocks,
      );

      expect(result).toEqual(expectedInvitations);
    });
  });
});
