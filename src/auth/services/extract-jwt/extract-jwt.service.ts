import { Injectable } from '@nestjs/common';

import * as express from 'express';
import { JwtFromRequestFunction } from 'passport-jwt';

@Injectable()
export class ExtractJwtService {
  public cookieExtractor(): JwtFromRequestFunction {
    return (req: express.Request): string | null => {
      let token: string | null = null;
      if (req && req.cookies) {
        token = req.cookies['access_token'];
      }

      return token;
    };
  }
}
