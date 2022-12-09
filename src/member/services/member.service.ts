import { Injectable, BadRequestException, Logger } from '@nestjs/common';

import { UsersService, MembersService } from '../../common/services';
import { CreateInvitationsDto } from '../dto';
import { Member, User } from '../../entities';
import {
  InvitationStatus,
  MemberRole,
  RequestStatus,
} from '../../common/enums';

@Injectable()
export class MemberService {
  private readonly logger = new Logger(MemberService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly membersService: MembersService,
  ) {}

  public async createInvitations(
    createdBy: string,
    { channelId, userNames }: CreateInvitationsDto,
  ): Promise<Member[]> {
    const invitations = await Promise.all(
      userNames.map(async (userName) => {
        try {
          const invitation: Member = await this.createInvitation(
            createdBy,
            channelId,
            userName,
          );
          return invitation;
        } catch (error) {
          this.logger.log(error.message);
          return null;
        }
      }),
    );

    return invitations.filter((invitation) => !!invitation);
  }

  public async createRequestToJoin(channelId: string, userId: string): Promise<Member> {
    const requestToJoinInstance: Member = await this.createRequestToJoinInstance(channelId, userId);

    const requestToJoin: Member = await this.membersService.save(requestToJoinInstance);

    return requestToJoin;
  }

  private async createInvitation(
    createdBy: string,
    channelId: string,
    userName: string,
  ): Promise<Member> {
    const user: User = await this.usersService.findOneByName(userName);
    if (!user)
      throw new BadRequestException(`There is no user with name ${userName}`);

    const memberInstance = this.createMemberInstance(
      user,
      createdBy,
      channelId,
    );

    const invitation: Member = await this.membersService.save(memberInstance);
    return invitation;
  }

  private createMemberInstance(
    user: User,
    createdBy: string,
    channelId: string,
  ): Member {
    const memberInstance = new Member();
    memberInstance.userId = user.id;
    memberInstance.role = MemberRole.MEMBER;
    memberInstance.channelId = channelId;
    memberInstance.invitationStatus = InvitationStatus.SENDED;
    memberInstance.requestStatus = RequestStatus.ACCEPTED;
    memberInstance.deleted = false;
    memberInstance.createdBy = createdBy;
    memberInstance.updatedBy = createdBy;

    return memberInstance;
  }

  private createRequestToJoinInstance(channelId: string, userId: string): Member {
    const requestToJoinInstance = new Member();
    requestToJoinInstance.userId = userId;
    requestToJoinInstance.role = MemberRole.MEMBER;
    requestToJoinInstance.channelId = channelId;
    requestToJoinInstance.invitationStatus = InvitationStatus.ACCEPTED;
    requestToJoinInstance.requestStatus = RequestStatus.SENDED;
    requestToJoinInstance.deleted = false;
    requestToJoinInstance.createdBy = userId;
    requestToJoinInstance.updatedBy = userId;

    return requestToJoinInstance;
  }
}
