import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import {
  RequestWithMember,
  RequestWithUser,
  RequestWithParams,
  ParamsWithChannelId,
} from '../../interfaces';
import { Member } from '../../../entities';
import { MembersService } from '../../services';

@Injectable()
export class VerifyMemberGuard implements CanActivate {
  constructor(private readonly membersService: MembersService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<
        RequestWithUser &
          RequestWithMember &
          RequestWithParams<ParamsWithChannelId>
      >();

    const { user, params } = request;
    const { channelId } = params;

    const member: Member =
      await this.membersService.findOneByUserIdAndChannelId(user.id, channelId);
    if (!member)
      throw new BadRequestException('You are not a member of this channel');

    request.member = member;

    return true;
  }
}
