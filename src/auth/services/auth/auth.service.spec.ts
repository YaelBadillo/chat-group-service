import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';

import { mock } from 'jest-mock-extended';
import { Chance } from 'chance';

import { UsersService } from '../../../common/services';
import { AuthService } from './auth.service';
import { PasswordService } from '../../../shared/password/password.service';
import { userMockFactory } from '../../../../test/utils/entity-mocks/user.entity.mock';
import { User } from '../../../entities';
import { LogInResponse, SignUpResponse } from '../../interfaces/responses.interface';

describe('AuthService', () => {
  let service: AuthService;
  let usersServiceMock: jest.Mocked<UsersService>;
  let passwordServiceMock: jest.Mocked<PasswordService>;
  let jwtServiceMock: jest.Mocked<JwtService>;

  let chance: Chance.Chance;

  beforeEach(async () => {
    usersServiceMock = mock<UsersService>();
    passwordServiceMock = mock<PasswordService>();
    jwtServiceMock = mock<JwtService>();

    chance = new Chance();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: PasswordService,
          useValue: passwordServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('signUp method', () => {
    let nameMock: string;
    let passwordMock: string;

    beforeEach(() => {
      nameMock = chance.name();
      passwordMock = chance.string({ length: 12 });
    });

    it('should throw if a user with the same name is found', async () => {
      usersServiceMock.findOneByName.mockReturnValue(
        (async () => userMockFactory(chance))(),
      );

      const execute = () => service.signUp(nameMock, passwordMock);

      await expect(execute).rejects.toThrowError(BadRequestException);
    });

    it('should return an object with a status and a message if the user was successfully created', async () => {
      const expectedSignUpResponse: SignUpResponse = {
        status: 'ok',
        message: 'Account has been created',
      };
      usersServiceMock.findOneByName.mockReturnValue(null);
      passwordServiceMock.encrypt.mockReturnValue((async () => '')());
      usersServiceMock.create.mockReturnValue((async () => new User())());

      const result: SignUpResponse = await service.signUp(nameMock, passwordMock);

      expect(result).toEqual(expectedSignUpResponse);
    });
  });

  describe('logIn method', () => {
    let nameMock: string;
    let passwordMock: string;

    beforeEach(() => {
      nameMock = chance.name();
      passwordMock = chance.string({ length: 12 });
    });

    it('should throw if a user with the same name is found', async () => {
      usersServiceMock.findOneByName.mockReturnValue((async () => null)());

      const execute = () => service.logIn(nameMock, passwordMock);

      await expect(execute).rejects.toThrowError(BadRequestException);
    });

    it('should throw if passwords do not match', async () => {
      usersServiceMock.findOneByName.mockReturnValue(
        (async () => userMockFactory(chance))(),
      );
      passwordServiceMock.compare.mockReturnValue((async () => false)());

      const execute = () => service.logIn(nameMock, passwordMock);

      await expect(execute).rejects.toThrowError(BadRequestException);
    });

    it('should return an object with the access token if the user was successfully logged', async () => {
      const accessTokenMock: string = chance.string({ length: 20 });
      const expectedLogInResponse: LogInResponse = {
        accessToken: accessTokenMock,
      };
      usersServiceMock.findOneByName.mockReturnValue((async () => new User())());
      passwordServiceMock.compare.mockReturnValue((async () => true)());
      jwtServiceMock.sign.mockReturnValue(accessTokenMock);

      const result: LogInResponse = await service.logIn(nameMock, passwordMock);

      expect(result).toEqual(expectedLogInResponse);
    });
  });
});
