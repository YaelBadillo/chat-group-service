import { IsNotEmpty, IsString, Length } from 'class-validator';

export class HandleMessageDto {
  @IsString()
  @Length(0, 255)
  @IsNotEmpty()
  channelId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}