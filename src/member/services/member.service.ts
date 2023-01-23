import { Injectable, BadRequestException, Logger } from '@nestjs/common';

import { UsersService, MembersService } from '../../common/services';
import { Member, User } from '../../entities';
import {
  InvitationStatus,
  MemberRole,
  RequestStatus,
} from '../../common/enums';

@Injectable()
export class MemberService {
  private readonly logger = new Logger(MemberService.name);
  private readonly invitationStatusErrorMessages = {
    [InvitationStatus.ACCEPTED]: 'The invitation was already accepted',
    [InvitationStatus.CANCELED]: 'The invitation was already cancelled',
    [InvitationStatus.EXPIRED]: 'The invitation was already expired',
    [InvitationStatus.REJECTED]: 'The invitation was already rejected',
  };

  constructor(
    private readonly usersService: UsersService,
    private readonly membersService: MembersService,
  ) {}

  public async createInvitations(
    createdBy: string,
    channelId: string,
    userNames: string[],
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

  public async acceptInvitation(newMember: Member): Promise<Member> {
    if (
      newMember.invitationStatus !== InvitationStatus.SENDED &&
      newMember.invitationStatus !== InvitationStatus.RECEIVED
    )
      throw new BadRequestException(
        this.invitationStatusErrorMessages[newMember.invitationStatus],
      );

    newMember.invitationStatus = InvitationStatus.ACCEPTED;

    await this.membersService.save(newMember);

    return newMember;
  }

  public async createRequestToJoin(
    userId: string,
    channelId: string,
  ): Promise<Member> {
    const requestToJoinInstance: Member = this.createRequestToJoinInstance(
      userId,
      channelId,
    );

    const requestToJoin: Member = await this.membersService.save(
      requestToJoinInstance,
    );

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

    const invitationInstance = this.createInvitationInstance(
      user.id,
      channelId,
      createdBy,
    );

    const invitation: Member = await this.membersService.save(
      invitationInstance,
    );
    return invitation;
  }

  private createInvitationInstance(
    userId: string,
    channelId: string,
    createdBy: string,
  ): Member {
    const invitationInstance = this.createMemberInstance(
      userId,
      channelId,
      createdBy,
    );
    invitationInstance.role = MemberRole.MEMBER;
    invitationInstance.invitationStatus = InvitationStatus.SENDED;
    invitationInstance.requestStatus = RequestStatus.ACCEPTED;

    return invitationInstance;
  }

  private createRequestToJoinInstance(
    userId: string,
    channelId: string,
  ): Member {
    const requestToJoinInstance = this.createMemberInstance(
      userId,
      channelId,
      userId,
    );
    requestToJoinInstance.role = MemberRole.MEMBER;
    requestToJoinInstance.invitationStatus = InvitationStatus.ACCEPTED;
    requestToJoinInstance.requestStatus = RequestStatus.SENDED;

    return requestToJoinInstance;
  }

  private createMemberInstance(
    userId: string,
    channelId: string,
    createdBy: string,
  ) {
    const memberInstance = new Member();
    memberInstance.userId = userId;
    memberInstance.channelId = channelId;
    memberInstance.deleted = false;
    memberInstance.createdBy = createdBy;
    memberInstance.updatedBy = createdBy;

    return memberInstance;
  }
}
