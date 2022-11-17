import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import { Public } from '../common/decorators';
import { SignUpDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('signup')
  @Public()
  public async signUp(@Body() { name, password }: SignUpDto) {
    return this.authService.signUp(name, password);
  }
}
