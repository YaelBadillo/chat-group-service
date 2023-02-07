import { Injectable } from '@nestjs/common';

import { MemberBuilderService } from '../builders';
import { Channel, User } from '../../../entities';
import { MemberRole, InvitationStatus, RequestStatus } from '../../enums';

@Injectable()
export class MemberDirectorService {
  private memberBuilderService: MemberBuilderService;

  public setBuilder(builder: MemberBuilderService): void {
    this.memberBuilderService = builder;
  }

  public createOwnerInstance(user: User, channel: Channel): void {
    this.createMemberInstance(user.id, channel.id, user.id);
    this.memberBuilderService.setRole(MemberRole.OWNER);
    this.memberBuilderService.setInvitationStatus(InvitationStatus.ACCEPTED);
    this.memberBuilderService.setRequestStatus(RequestStatus.ACCEPTED);
  }

  public createInvitationInstance(
    userId: string,
    channelId: string,
    createdBy: string,
  ): void {
    this.createMemberInstance(userId, channelId, createdBy);
    this.memberBuilderService.setRole(MemberRole.MEMBER);
    this.memberBuilderService.setInvitationStatus(InvitationStatus.SENDED);
    this.memberBuilderService.setRequestStatus(RequestStatus.ACCEPTED);
  }

  public createRequestToJoinInstance(
    userId: string,
    channelId: string,
    createdBy: string,
  ): void {
    this.createMemberInstance(userId, channelId, createdBy);
    this.memberBuilderService.setRole(MemberRole.MEMBER);
    this.memberBuilderService.setInvitationStatus(InvitationStatus.ACCEPTED);
    this.memberBuilderService.setRequestStatus(RequestStatus.SENDED);
  }

  private createMemberInstance(
    userId: string,
    channelId: string,
    createdBy: string,
  ): void {
    this.memberBuilderService.setUserId(userId);
    this.memberBuilderService.setChannelId(channelId);
    this.memberBuilderService.setDeleted(false);
    this.memberBuilderService.setCreatedBy(createdBy);
    this.memberBuilderService.setUpdatedBy(createdBy);
  }
}
