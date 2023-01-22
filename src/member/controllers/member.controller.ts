import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { UserFromRequest } from 'src/common/decorators';
import { CreateInvitationsDto } from '../dto';

import { MemberService } from '../services';
import { MemberGateway } from '../gateways';
import { User, Member } from '../../entities';

@Controller('member')
export class MemberController {
  constructor(
    private readonly memberService: MemberService,
    private readonly memberGateway: MemberGateway,
  ) {}

  @Post(':channelId/create-invitations')
  @HttpCode(HttpStatus.CREATED)
  public async createInvitations(
    @Body() createInvitationsDto: CreateInvitationsDto,
    @UserFromRequest() user: User,
    @Param('channelId') channelId: string,
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
}
