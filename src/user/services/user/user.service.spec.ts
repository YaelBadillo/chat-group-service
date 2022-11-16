import { Test, TestingModule } from '@nestjs/testing';

import { mock } from 'jest-mock-extended';
import { Chance } from 'chance';

import { UserService } from './user.service';
import { PasswordEncrypterService } from '../password-encrypter/password-encrypter.service';
import { UsersService } from '../../../common/repositories';
import { User } from '../../../entities';
import { CreateUserDto } from '../../dto';
import { userMockFactory } from '../../../../test/utils/entity-mocks';

describe('UserService', () => {
  let service: UserService;
  let usersServiceMock: jest.Mocked<UsersService>;
  let passwordEncrypterServiceMock: jest.Mocked<PasswordEncrypterService>;

  beforeEach(async () => {
    usersServiceMock = mock<UsersService>();
    passwordEncrypterServiceMock = mock<PasswordEncrypterService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: PasswordEncrypterService,
          useValue: passwordEncrypterServiceMock,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('findUserByName method', () => {
    let userNameMock: string;

    let chance: Chance.Chance;

    beforeEach(() => {
      chance = new Chance();

      userNameMock = chance.string({ length: 15 });

      usersServiceMock.findOneByName.mockReturnValue(
        (async () => new User())(),
      );
    });

    it('should return the found user', async () => {
      const userMock: User = userMockFactory(chance);
      const expectedUser: Partial<User> = {
        ...userMock,
        name: userNameMock,
      };
      usersServiceMock.findOneByName.mockImplementation(
        async (name: string) => {
          userMock.name = name;

          return userMock;
        },
      );

      const result: User = await service.findUserByName(userNameMock);

      expect(result).toEqual(expectedUser);
    });

    it('should return null if the user is not found', async () => {
      usersServiceMock.findOneByName.mockReturnValue(null);

      const result: User = await service.findUserByName(userNameMock);

      expect(result).toBeNull();
    });
  });

  describe('create method', () => {
    let createUserDtoMock: jest.Mocked<CreateUserDto>;
    let userMock: jest.Mocked<User>;
    let hashedPasswordMock: string;

    let chance: Chance.Chance;

    beforeEach(() => {
      chance = new Chance();

      createUserDtoMock = new CreateUserDto();
      createUserDtoMock.name = chance.string({ length: 20 });
      createUserDtoMock.state = chance.string({ length: 20 });
      createUserDtoMock.password = chance.string({ length: 20 });

      userMock = new User();
      userMock.name = createUserDtoMock.name;
      userMock.state = createUserDtoMock.state;
      userMock.password = createUserDtoMock.password;

      hashedPasswordMock = chance.string({ length: 20 });

      usersServiceMock.create.mockReturnValue((async () => new User())());
      passwordEncrypterServiceMock.encrypt.mockReturnValue(
        (async () => hashedPasswordMock)(),
      );
    });

    it('should create user with encrypted password', async () => {
      const expectedUser: User = new User();
      expectedUser.name = userMock.name;
      expectedUser.state = userMock.state;
      expectedUser.password = hashedPasswordMock;

      await service.create(createUserDtoMock);

      expect(usersServiceMock.create).toBeCalledTimes(1);
      expect(usersServiceMock.create).toBeCalledWith(expectedUser);
    });

    it('should return the created user', async () => {
      const newUserMock = new User();
      newUserMock.name = userMock.name;
      newUserMock.state = userMock.state;
      newUserMock.password = hashedPasswordMock;
      usersServiceMock.create.mockReturnValue((async () => newUserMock)());

      const result = await service.create(createUserDtoMock);

      expect(result).toEqual(newUserMock);
    });
  });
});