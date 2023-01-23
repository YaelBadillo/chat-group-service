import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

import { Member } from '../../entities';
import { InvitationStatus, MemberRole, RequestStatus } from '../enums';
import { RequestWithMember } from '../interfaces';

export const MemberFromRequest = createParamDecorator(
  (
    propertyName: string,
    context: ExecutionContext,
  ):
    | Member
    | string
    | MemberRole
    | InvitationStatus
    | RequestStatus
    | boolean
    | Date => {
    const { member } = context.switchToHttp().getRequest<RequestWithMember>();
    if (!member)
      throw new InternalServerErrorException('Member could not be found');

    return propertyName ? member?.[propertyName] : member;
  },
);
