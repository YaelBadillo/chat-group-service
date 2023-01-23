import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Patch
} from '@nestjs/common';

import { CreateInvitationsDto } from '../dto';
import { MemberService } from '../services';
import { MemberGateway } from '../gateways';
import { User, Member, Channel } from '../../entities';
import {
  UserFromRequest,
  ChannelFromRequest,
  VerifyChannel,
  VerifyMember,
  MemberFromRequest,
} from '../../common/decorators';

@Controller('member')
export class MemberController {
  constructor(
    private readonly memberService: MemberService,
    private readonly memberGateway: MemberGateway,
  ) {}

  @Post(':channelId/create-invitations')
  @HttpCode(HttpStatus.CREATED)
  public async createInvitations(
    @Param('channelId') channelId: string,
    @Body() createInvitationsDto: CreateInvitationsDto,
    @UserFromRequest() user: User,
  ): Promise<Member[]> {
    const { id: userId }: User = user;

    const invitations: Member[] = await this.memberService.createInvitations(
      userId,
      channelId,
      createInvitationsDto.userNames,
    );

    this.memberGateway.sendInvitationsToEachActiveUser(invitations);

    return invitations;
  }

  @Patch(':channelId/accept-invitation')
  @HttpCode(HttpStatus.OK)
  @VerifyMember()
  public async acceptInvitation(
    @MemberFromRequest() member: Member,
  ): Promise<Member> {
    const newMember: Member = await this.memberService.acceptInvitation(member);

    this.memberGateway.notifyNewMemberToEachActiveMember(newMember);

    return newMember;
  }

  @Post(':channelId/create-request-to-join')
  @HttpCode(HttpStatus.CREATED)
  @VerifyChannel()
  public async createRequestToJoin(
    @Param('channelId') channelId: string,
    @UserFromRequest() user: User,
    @ChannelFromRequest() channel: Channel,
  ): Promise<Member> {
    const requestToJoin: Member = await this.memberService.createRequestToJoin(
      user.id,
      channelId,
    );

    this.memberGateway.sendRequestToJoinToOwnerMember(
      channel.ownerId,
      requestToJoin,
    );

    return requestToJoin;
  }
}
