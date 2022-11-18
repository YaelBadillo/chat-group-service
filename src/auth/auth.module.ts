import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './services';
import { AuthController } from './controllers';
import { PasswordModule } from '../shared';
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
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
