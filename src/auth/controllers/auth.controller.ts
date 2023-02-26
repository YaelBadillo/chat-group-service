import {
  Body,
  Controller,
  HttpCode,
  Post,
  HttpStatus,
  Res,
} from '@nestjs/common';

import { Response } from 'express';

import { AuthService } from '../services';
import { Public } from '../../common/decorators';
import { SignUpDto, LogInDto } from '../dto';
import { SignUpResponse, LogInResponse } from '../interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  public signUp(
    @Body() { name, password }: SignUpDto,
  ): Promise<SignUpResponse> {
    return this.authService.signUp(name, password);
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  public async logIn(
    @Body() { name, password }: LogInDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LogInResponse> {
    const logInResponse: LogInResponse = await this.authService.logIn(
      name,
      password,
    );

    res.cookie('access_token', logInResponse.accessToken, { httpOnly: true });

    return logInResponse;
  }
}
