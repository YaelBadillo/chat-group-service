import { Body, Controller, HttpCode, Post, HttpStatus } from '@nestjs/common';

import { AuthService } from '../services';
import { Public } from '../../common/decorators';
import { SignUpDto } from '../dto';
import { User } from '../../entities';
import { LogInResponse } from '../interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  public signUp(@Body() { name, password }: SignUpDto): Promise<User> {
    return this.authService.signUp(name, password);
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  public logIn(@Body() { name, password }): Promise<LogInResponse> {
    return this.authService.logIn(name, password);
  }
}
