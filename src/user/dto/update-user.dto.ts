import { IsNotEmpty, IsString, Length } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @Length(3, 30)
  @IsNotEmpty()
  newName: string;

  @IsString()
  @IsNotEmpty()
  @Length(0, 40)
  newState: string;
}