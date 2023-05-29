import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DatesHelper } from './utils';
import { InvitationStatus, MemberRole, RequestStatus } from '../common/enums';

@Entity('members')
export class Member extends DatesHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  userId: string;

  @Column({ type: 'enum', enum: MemberRole, default: MemberRole.MEMBER })
  role: MemberRole;

  @Column({ type: 'varchar' })
  channelId: string;

  @Column({ type: 'enum', enum: InvitationStatus })
  invitationStatus: InvitationStatus;

  @Column({ type: 'enum', enum: RequestStatus })
  requestStatus: RequestStatus;

  @Column({ type: 'boolean' })
  deleted: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  expireAt: Date;

  @Column({ type: 'varchar' })
  createdBy: string;

  @Column({ type: 'varchar' })
  updatedBy: string;
}
