import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DatesHelper } from './utils';

@Entity('messages')
export class Message extends DatesHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  content: string;

  @Column({ type: 'varchar' })
  channelId: string;

  @Column({ type: 'varchar' })
  memberId: string;

  @Column({ type: 'varchar', nullable: true })
  messageIdToReply: string;
}