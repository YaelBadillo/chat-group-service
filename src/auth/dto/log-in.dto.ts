import { IsNotEmpty, IsString, Length } from 'class-validator';

export class LogInDto {
  @IsString()
  @Length(3, 30)
  @IsNotEmpty()
  name: string;

  @IsString()
  @Length(6, 40)
  @IsNotEmpty()
  password: string;
}
