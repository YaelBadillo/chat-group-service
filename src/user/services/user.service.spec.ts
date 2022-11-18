import { Test, TestingModule } from '@nestjs/testing';

import { mock } from 'jest-mock-extended';
import { Chance } from 'chance';

import { UsersService } from '../../common/services';
import { UserService } from './user.service';
import { User } from '../../entities/user.entity';
import { userMockFactory } from '../../../test/utils/entity-mocks/user.entity.mock';
import { BadRequestException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let usersServiceMock: jest.Mocked<UsersService>;

  let chance: Chance.Chance;

  beforeEach(async () => {
    usersServiceMock = mock<UsersService>();

    chance = new Chance();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UsersService,
          useValue: usersServiceMock,
        }
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('updateUser', () => {
    let userMock: User;
    let newNameMock: string;
    let newStateMock: string;

    beforeEach(() => {
      userMock = userMockFactory(chance);
      newNameMock = chance.name();
      newStateMock = chance.string({ length: 20 });

      usersServiceMock.create.mockReturnValue((async () => new User())());
    });

    it('should throw if the name is invalid', async () => {
      const expectedErrorMessage: string = `${newNameMock} name is already taken. Please choose another`;
      usersServiceMock.findOneByName.mockReturnValue((async () => new User())())

      const execute = () => service.updateUser(
        userMock,
        newNameMock,
        newStateMock,
      );

      await expect(execute).rejects.toThrowError(BadRequestException);
      await expect(execute).rejects.toThrow(expectedErrorMessage);
    });

    it('should update user', async () => {
      await service.updateUser(
        userMock,
        newNameMock,
        newStateMock,
      );

      expect(usersServiceMock.create).toBeCalledTimes(1);
      expect(usersServiceMock.create).toBeCalledWith(userMock);
    });

    it('should return the updated user', async () => {
      const expectedUpdatedUser: User = {
        ...userMock,
      }
      expectedUpdatedUser.name = newNameMock;
      expectedUpdatedUser.state = newStateMock;

      const result = await service.updateUser(
        userMock,
        newNameMock,
        newStateMock,
      );

      expect(result).toEqual(expectedUpdatedUser);
    });
  });
});
