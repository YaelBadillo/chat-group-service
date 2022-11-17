import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PasswordModule } from '../shared/password/password.module';
import { JwtStrategy } from './strategies';

@Module({
  imports: [
    JwtModule.register({
      secret: '12345',
      signOptions: { expiresIn: '1d' },
    }),
    PasswordModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
  ],
})
export class AuthModule {}
