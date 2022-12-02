import { Injectable, BadRequestException, Logger } from '@nestjs/common';

import { UsersService, MembersService } from '../../common/services';
import { CreateInvitationDto } from '../dto';
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
    createInvitationDtos: CreateInvitationDto[],
  ) {
    const invitations = await Promise.all(
      createInvitationDtos.map(async (createInvitationDto) => {
        try {
          const invitation: Member = await this.createInvitation(createdBy, createInvitationDto);
          return invitation;
        } catch (error) {
          this.logger.log(error.message)
          return null;
        }
      }),
    );

    return invitations.filter((invitation) => !!invitation);
  }

  private async createInvitation(
    createdBy: string,
    createInvitationDto: CreateInvitationDto,
  ) {
    const user: User = await this.usersService.findOneByName(
      createInvitationDto.userName,
    );
    if (!user)
      throw new BadRequestException(
        `There is no user with name ${createInvitationDto.userName}`,
      );

    const memberInstance = this.createMemberInstance(
      user,
      createdBy,
      createInvitationDto,
    );

    const invitation: Member = await this.membersService.save(memberInstance);
    return invitation;
  }

  private createMemberInstance(
    user: User,
    createdBy: string,
    createInvitationDto: CreateInvitationDto,
  ): Member {
    const memberInstance = new Member();
    memberInstance.userId = user.id;
    memberInstance.role = MemberRole.MEMBER;
    memberInstance.channelId = createInvitationDto.channelId;
    memberInstance.invitationStatus = InvitationStatus.SENDED;
    memberInstance.requestStatus = RequestStatus.ACCEPTED;
    memberInstance.deleted = false;
    memberInstance.createdBy = createdBy;
    memberInstance.updatedBy = createdBy;

    return memberInstance;
  }
}
