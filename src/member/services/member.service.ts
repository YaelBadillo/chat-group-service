import { Injectable, BadRequestException, Logger } from '@nestjs/common';

import { UsersService, MembersService } from '../../common/services';
import { Member, User } from '../../entities';
import { InvitationStatus, RequestStatus } from '../../common/enums';
import { MemberBuilderService } from '../../common/entities/builders';
import { MemberDirectorService } from '../../common/entities/directors';

@Injectable()
export class MemberService {
  private readonly logger = new Logger(MemberService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly membersService: MembersService,
    private readonly memberBuilderService: MemberBuilderService,
    private readonly memberDirectorService: MemberDirectorService,
  ) {
    this.memberDirectorService.setBuilder(this.memberBuilderService);
  }

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
          if (invitation.invitationStatus !== InvitationStatus.SENDED)
            return null;

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
        `The invitation was already ${newMember.invitationStatus}`,
      );

    newMember.invitationStatus = InvitationStatus.ACCEPTED;

    await this.membersService.save(newMember);

    return newMember;
  }

  public async createRequestToJoin(
    userId: string,
    channelId: string,
  ): Promise<Member> {
    this.memberDirectorService.buildRequestToJoinInstance(userId, channelId);
    const requestToJoinInstance: Member = this.memberBuilderService.getResult();

    const requestToJoin: Member = await this.membersService.save(
      requestToJoinInstance,
    );

    return requestToJoin;
  }

  public async acceptRequestToJoin(memberId: string): Promise<Member> {
    const newMember: Member = await this.membersService.findOneById(memberId);
    if (
      newMember.requestStatus !== RequestStatus.ACCEPTED &&
      newMember.requestStatus !== RequestStatus.SENDED
    )
      throw new BadRequestException(
        `The request was already ${newMember.requestStatus}`,
      );

    newMember.requestStatus = RequestStatus.ACCEPTED;

    await this.membersService.save(newMember);

    return newMember;
  }

  private async createInvitation(
    createdBy: string,
    channelId: string,
    userName: string,
  ): Promise<Member> {
    const user: User = await this.usersService.findOneByName(userName);
    if (!user)
      throw new BadRequestException(`There is no user with name ${userName}`);

    const existingInvitation: Member =
      await this.membersService.findOneByUserIdAndChannelId(user.id, channelId);
    if (existingInvitation) return existingInvitation;

    this.memberDirectorService.buildInvitationInstance(
      user.id,
      channelId,
      createdBy,
    );
    const invitationInstance: Member = this.memberBuilderService.getResult();

    const invitation: Member = await this.membersService.save(
      invitationInstance,
    );
    return invitation;
  }
}
