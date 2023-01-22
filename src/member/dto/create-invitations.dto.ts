import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class CreateInvitationsDto {
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  userNames: string[];
}
