import { Test, TestingModule } from '@nestjs/testing';

import { mock } from 'jest-mock-extended';
import { Chance } from 'chance';

import { AuthController } from './auth.controller';
import { AuthService } from '../services';
import { SignUpDto } from '../dto/sign-up.dto';
import { LogInResponse } from '../../../dist/auth/interfaces/responses.interface';
import { LogInDto } from '../dto';
import { userMockFactory } from '../../../test/utils/entity-mocks/user.entity.mock';
import { User } from 'src/entities';

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
        confirmPassword: passwordMock,
      };
    });

    it('should return an object with a message if the user was successfully registered', async () => {
      const userMock: User = userMockFactory(chance);
      const expectedUser: User = { ...userMock };
      authServiceMock.signUp.mockReturnValue((async () => userMock)());

      const result = await controller.signUp(signUpDtoMock);

      expect(result).toEqual(expectedUser);
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

    it('should return the user an his access token if user was successfully logged in', async () => {
      const userMock: Omit<User, 'password'> = userMockFactory(chance);
      const accessTokenMock: string = chance.string({ length: 20 });
      const logInResponseMock: LogInResponse = {
        user: userMock,
        accessToken: accessTokenMock,
      };
      const expectedLogInResponse: LogInResponse = {
        user: userMock,
        accessToken: accessTokenMock,
      };
      authServiceMock.logIn.mockReturnValue((async () => logInResponseMock)());

      const result: LogInResponse = await controller.logIn(logInDtoMock);

      expect(result).toEqual(expectedLogInResponse);
    });
  });
});
