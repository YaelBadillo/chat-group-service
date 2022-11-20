import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { AuthService } from './services';
import { AuthController } from './controllers';
import { PasswordModule } from '../shared';
import { JwtStrategy } from './strategies';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        ...configService.get<JwtModuleOptions>('jwt'),
      }),
      inject: [ConfigService],
    }),
    PasswordModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
