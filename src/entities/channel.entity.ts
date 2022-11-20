import { Column, PrimaryGeneratedColumn } from 'typeorm';

import { SpaceType } from '../common/enums';
import { DatesHelper } from './utils';

export class Channel extends DatesHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 30 })
  name: string;

  @Column({ type: 'enum' })
  space: SpaceType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ type: 'varchar' })
  ownerId: string;
  
  @Column({ type: 'varchar' })
  createdBy: string;

  @Column({ type: 'varchar' })
  updatedBy: string;
}