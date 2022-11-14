import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(3, 20)
  @IsNotEmpty()
  name: string;

  @IsString()
  @Length(0, 255)
  @IsOptional()
  state?: string;

  @IsString()
  @Length(0, 30)
  @IsNotEmpty()
  password: string;
}
