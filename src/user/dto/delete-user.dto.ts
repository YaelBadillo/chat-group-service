import { IsNotEmpty, IsString, Length } from 'class-validator';

export class DeleteUserDto {
  @IsString()
  @Length(6, 40)
  @IsNotEmpty()
  password: string;
}