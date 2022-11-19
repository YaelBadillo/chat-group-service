import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { Match } from '../../common/decorators';

export class UpdatePasswordDto {
  @IsString()
  @Length(6, 40)
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @Length(6, 40)
  @IsNotEmpty()
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  newPassword: string;

  @IsString()
  @Length(6, 40)
  @IsNotEmpty()
  @Match('password', { message: 'password do not match' })
  newConfirmPassword: string;
}