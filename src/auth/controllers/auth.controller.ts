import { Body, Controller, HttpCode, Post, HttpStatus } from '@nestjs/common';

import { AuthService } from '../services';
import { Public } from '../../common/decorators';
import { SignUpDto, LogInDto } from '../dto';
import { User } from '../../entities';
import { LogInResponse } from '../interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  public signUp(@Body() { name, password }: SignUpDto): Promise<User> {
    console.log('a ' + name);
    console.log('b ' + password);
    return this.authService.signUp(name, password);
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  public logIn(@Body() { name, password }: LogInDto): Promise<LogInResponse> {
    return this.authService.logIn(name, password);
  }
}
