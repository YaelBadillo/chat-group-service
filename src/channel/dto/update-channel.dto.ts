import { SpaceType } from '../../common/enums';

export class UpdateChannelDto {
  name: string; 
  space: SpaceType;
  description: string;
}