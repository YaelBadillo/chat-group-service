import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @Length(1, 255)
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  messageIdToReply: string;
}
