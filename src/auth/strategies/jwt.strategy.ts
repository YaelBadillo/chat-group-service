import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

import { ExtractJwt, Strategy } from 'passport-jwt';

import { ExtractJwtService } from '../services';
import { UsersService } from '../../common/services';
import { User } from '../../entities';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly extractJwtService: ExtractJwtService,
    private readonly usersService: UsersService,
  ) {
    super({
      secretOrKey: configService.get<string>('jwt.secret'),
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        extractJwtService.cookieExtractor(),
      ]),
      ignoreExpiration: false,
    });
  }

  async validate(payload: { name: string }): Promise<User> {
    const user: User = await this.usersService.findOneByName(payload.name);
    if (!user)
      throw new UnauthorizedException(
        'User does not exist, please authenticate',
      );

    return user;
  }
}
