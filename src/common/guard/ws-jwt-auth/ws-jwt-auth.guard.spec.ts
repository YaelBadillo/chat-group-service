import { TestingModule, Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { WsArgumentsHost } from '@nestjs/common/interfaces';

import { Chance } from 'chance';
import { mock } from 'jest-mock-extended';

import { WsJwtAuthGuard } from './ws-jwt-auth.guard';
import { UsersService } from '../../services';
import { User } from '../../../entities';
import { userMockFactory } from '../../../../test/utils/entity-mocks';
import { SocketWithUser } from '../../types';

describe('WsJwtAuthGuard', () => {
  let guard: WsJwtAuthGuard;
  let jwtServiceMock: jest.Mocked<JwtService>;
  let usersServiceMock: jest.Mocked<UsersService>;
  let configServiceMock: jest.Mocked<ConfigService>;

  let chance: Chance.Chance;

  beforeEach(async () => {
    jwtServiceMock = mock<JwtService>();
    usersServiceMock = mock<UsersService>();
    configServiceMock = mock<ConfigService>();

    chance = new Chance();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WsJwtAuthGuard,
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    guard = module.get<WsJwtAuthGuard>(WsJwtAuthGuard);
  });

  describe('canActivate method', () => {
    let contextMock: jest.Mocked<ExecutionContext>;
    let wsArgumentsHost: jest.Mocked<WsArgumentsHost>;
    let socketMock: SocketWithUser;

    beforeEach(() => {
      contextMock = mock<ExecutionContext>();
      wsArgumentsHost = mock<WsArgumentsHost>();
      socketMock = mock<SocketWithUser>();

      contextMock.switchToWs.mockReturnValue(wsArgumentsHost);
      wsArgumentsHost.getClient.mockReturnValue(socketMock);

      socketMock.handshake.auth = {
        token: chance.string({ length: 20 }),
      };
      jwtServiceMock.verify.mockReturnValue(
        (async () => {
          name: chance.name();
        })(),
      );
      usersServiceMock.findOneByName.mockReturnValue(
        (async () => new User())(),
      );
    });

    it('should throw if no token is provided', async () => {
      const expectedErrorMessage = 'No token provided';
      socketMock.handshake.auth = {};

      const execute = () => guard.canActivate(contextMock);

      await expect(execute).rejects.toThrowError(UnauthorizedException);
      await expect(execute).rejects.toThrow(expectedErrorMessage);
    });

    it('should throw if the token is invalid', async () => {
      const expectedErrorMessage = 'Invalid token';
      jwtServiceMock.verify.mockImplementation(() => {
        throw new Error();
      });

      const execute = () => guard.canActivate(contextMock);

      await expect(execute).rejects.toThrowError(UnauthorizedException);
      await expect(execute).rejects.toThrow(expectedErrorMessage);
    });

    it('should throw if the user was not found', async () => {
      const expectedErrorMessage = 'User does not exists, please authenticate';
      usersServiceMock.findOneByName.mockReturnValue((async () => null)());

      const execute = () => guard.canActivate(contextMock);

      await expect(execute).rejects.toThrowError(UnauthorizedException);
      await expect(execute).rejects.toThrow(expectedErrorMessage);
    });

    it('should attach user to the client object', async () => {
      const userMock: User = userMockFactory(chance);
      const expectedUser: User = { ...userMock };
      usersServiceMock.findOneByName.mockReturnValue((async () => userMock)());

      await guard.canActivate(contextMock);

      expect(socketMock.user).toEqual(expectedUser);
    });

    it('should return true if can permission', async () => {
      const result: boolean = await guard.canActivate(contextMock);

      expect(result).toBeTruthy();
    });
  });
});
