import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

import { mock } from 'jest-mock-extended';
import { Chance } from 'chance';

import { UserController } from './user.controller';
import { UserService } from './services';
import { CreateUserDto } from './dto';
import { User } from '../entities';

describe('UserController', () => {
  let controller: UserController;
  let userServiceMock: jest.Mocked<UserService>;

  let chance: Chance.Chance;

  beforeEach(async () => {
    userServiceMock = mock<UserService>();

    chance = new Chance();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: UserService,
          useValue: userServiceMock,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  describe('create method', () => {
    let createUserDtoMock: CreateUserDto;
    let newUser: User;

    beforeEach(() => {
      createUserDtoMock = new CreateUserDto();
      createUserDtoMock.name = chance.string({ length: 20 });
      createUserDtoMock.state = chance.paragraph({ sentence: 1 });
      createUserDtoMock.password = chance.string({ length: 20 });

      newUser = new User();
      newUser.name = createUserDtoMock.name;
      newUser.state = createUserDtoMock.state;
      newUser.password = chance.string({ length: 20 });

      userServiceMock.findUserByName.mockReturnValue((async () => null)());
      userServiceMock.create.mockReturnValue((async () => newUser)());
    });

    it('should throw if a user with the same name already exists', async () => {
      const expectedErrorMessage = `A user with the name ${createUserDtoMock.name} already exists`;
      userServiceMock.findUserByName.mockReturnValue(
        (async () => new User())(),
      );

      const execute = () => controller.create(createUserDtoMock);

      await expect(execute).rejects.toThrowError(BadRequestException);
      await expect(execute).rejects.toThrow(expectedErrorMessage);
    });

    it('should create user', async () => {
      await controller.create(createUserDtoMock);

      expect(userServiceMock.create).toBeCalledTimes(1);
    });

    it('should return the user created', async () => {
      const expectedNewUser = new User();
      expectedNewUser.name = newUser.name;
      expectedNewUser.state = newUser.state;
      expectedNewUser.password = newUser.password;

      const result: User = await controller.create(createUserDtoMock);

      expect(result).toEqual(expectedNewUser);
    });
  });
});
