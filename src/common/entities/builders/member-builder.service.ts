import { Injectable } from '@nestjs/common';

import { MemberRole, InvitationStatus, RequestStatus } from '../../enums';
import { Member } from '../../../entities';
import { Builder } from './interfaces';

@Injectable()
export class MemberBuilderService implements Builder {
  private member: Member;

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.member = new Member();
  }

  public setUserId(userId: string): void {
    this.member.userId = userId;
  }

  public setChannelId(channelId: string): void {
    this.member.channelId = channelId;
  }

  public setDeleted(deleted: boolean): void {
    this.member.deleted = deleted;
  }

  public setCreatedBy(userId: string): void {
    this.member.createdBy = userId;
  }

  public setUpdatedBy(userId: string): void {
    this.member.updatedBy = userId;
  }

  public setRole(role: MemberRole): void {
    this.member.role = role;
  }

  public setInvitationStatus(invitationStatus: InvitationStatus): void {
    this.member.invitationStatus = invitationStatus;
  }

  public setRequestStatus(requestStatus: RequestStatus): void {
    this.member.requestStatus = requestStatus;
  }

  public getResult(): Member {
    const member = this.member;
    this.reset();
    return member;
  }
}
