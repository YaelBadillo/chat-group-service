import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, Length, ValidateNested } from 'class-validator';

export class CreateInvitationsDto {
  @IsString()
  @Length(0, 255)
  @IsNotEmpty()
  channelId: string;

  @Type(() => String)
  @ValidateNested({ each: true })
  userNames: string[];
}