import { Test, TestingModule } from '@nestjs/testing';

import { mock } from 'jest-mock-extended';
import { Chance } from 'chance';

import { AuthController } from './auth.controller';
import { AuthService } from '../services';
import { SignUpResponse, LogInResponse } from '../interfaces';
import { SignUpDto, LogInDto } from '../dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authServiceMock: jest.Mocked<AuthService>;

  let chance: Chance.Chance;

  beforeEach(async () => {
    authServiceMock = mock<AuthService>();

    chance = new Chance();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('signUp method', () => {
    let nameMock: string;
    let passwordMock: string;
    let signUpDtoMock: SignUpDto;

    beforeEach(() => {
      nameMock = chance.name();
      passwordMock = chance.string({ length: 12 });
      signUpDtoMock = {
        name: nameMock,
        password: passwordMock,
        passwordConfirm: passwordMock,
      };
    });

    it('should return an object with a status and a message', async () => {
      const signUpResponseMock: SignUpResponse = {
        status: 'ok',
        message: 'Account has been created',
      };
      const expectedSignUpResponseMock: SignUpResponse = {
        ...signUpResponseMock,
      }
      authServiceMock.signUp.mockReturnValue((async () => signUpResponseMock)());

      const result = await controller.signUp(signUpDtoMock);

      expect(result).toEqual(expectedSignUpResponseMock);
    });
  });

  describe('logIn method', () => {
    let nameMock: string;
    let passwordMock: string;
    let logInDtoMock: LogInDto;

    beforeEach(() => {
      nameMock = chance.name();
      passwordMock = chance.street({ length: 12 });
      logInDtoMock = {
        name: nameMock,
        password: passwordMock,
      };
    });

    it('should return an object with the access token', async () => {
      const accessTokenMock: string = chance.string({ length: 20 });
      const logInResponseMock: LogInResponse = {
        accessToken: accessTokenMock,
      };
      const expectedLogInResponse: LogInResponse = {
        accessToken: accessTokenMock,
      };
      authServiceMock.logIn.mockReturnValue((async () => logInResponseMock)());

      const result: LogInResponse = await controller.logIn(logInDtoMock);

      expect(result).toEqual(expectedLogInResponse);
    });
  });
});
