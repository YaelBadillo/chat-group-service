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

  public buildOwnerInstance(userId: string, channelId: string): void {
    this.buildMemberInstance(userId, channelId, userId);
    this.memberBuilderService.setRole(MemberRole.OWNER);
    this.memberBuilderService.setInvitationStatus(InvitationStatus.ACCEPTED);
    this.memberBuilderService.setRequestStatus(RequestStatus.ACCEPTED);
  }

  public buildInvitationInstance(
    userId: string,
    channelId: string,
    createdBy: string,
  ): void {
    this.buildMemberInstance(userId, channelId, createdBy);
    this.memberBuilderService.setRole(MemberRole.MEMBER);
    this.memberBuilderService.setInvitationStatus(InvitationStatus.SENDED);
    this.memberBuilderService.setRequestStatus(RequestStatus.ACCEPTED);
  }

  public buildRequestToJoinInstance(userId: string, channelId: string): void {
    this.buildMemberInstance(userId, channelId, userId);
    this.memberBuilderService.setRole(MemberRole.MEMBER);
    this.memberBuilderService.setInvitationStatus(InvitationStatus.ACCEPTED);
    this.memberBuilderService.setRequestStatus(RequestStatus.SENDED);
  }

  private buildMemberInstance(
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
