import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

import { Match } from '../decorators';

export class SignUpDto {
  @IsString()
  @Length(3, 30)
  @IsNotEmpty()
  name: string;

  @IsString()
  @Length(6, 40)
  @IsNotEmpty()
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @Match('password', { message: 'password do not match' })
  passwordConfirm: string;
}
