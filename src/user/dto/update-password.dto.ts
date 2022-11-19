import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { Match } from '../../common/decorators';
import { DoesNotMatch } from '../decorator';

export class UpdatePasswordDto {
  @IsString()
  @Length(6, 40)
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @Length(6, 40)
  @IsNotEmpty()
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'newPassword too weak',
  })
  @DoesNotMatch('oldPassword', {
    message: 'newPassword should be different from oldPassword',
  })
  newPassword: string;

  @IsString()
  @Length(6, 40)
  @IsNotEmpty()
  @Match('newPassword', { message: 'newPassword do not match' })
  newPasswordConfirm: string;
}
