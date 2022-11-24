import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';

import { SpaceType } from '../../common/enums';

export class CreateChannelDto {
  @IsString()
  @Length(3, 30)
  @IsNotEmpty()
  name: string;

  @IsEnum(SpaceType)
  @IsNotEmpty()
  space: SpaceType;

  @IsString()
  @Length(0, 255)
  @IsNotEmpty()
  description: string;
}
