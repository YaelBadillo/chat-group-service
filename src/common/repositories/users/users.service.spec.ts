import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { mock } from 'jest-mock-extended';
import { Chance } from 'chance';

import { UsersService } from '../.';
import { User } from '../../../entities';
import { userMockFactory } from '../../../../test/utils/entity-mocks';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepositoryMock: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    usersRepositoryMock = mock<Repository<User>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: usersRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('create method', () => {
    let userMock: jest.Mocked<User>;

    let chance: Chance.Chance;

    beforeEach(() => {
      chance = new Chance();

      userMock = mock<User>();

      usersRepositoryMock.save.mockReturnValue((async () => userMock)());
    });

    it('should save the user passed as argument', async () => {
      await service.create(userMock);

      expect(usersRepositoryMock.save).toBeCalledTimes(1);
      expect(usersRepositoryMock.save).toBeCalledWith(userMock);
    });

    it('should return the created user', async () => {
      const result: User = await service.create(userMock);

      expect(result).toEqual(userMock);
    });

    it('should return the updated user', async () => {
      let updatedUserMock: User = userMockFactory(chance);
      const expectedUser: User = {
        ...updatedUserMock,
        ...userMock,
      };
      usersRepositoryMock.save.mockImplementation(
        async (entity: Partial<User>) => {
          updatedUserMock = {
            ...updatedUserMock,
            ...entity,
          };

          return updatedUserMock;
        },
      );

      const result: User = await service.create(userMock);

      expect(result).toEqual(expectedUser);
    });
  });

  describe('findOneByName method', () => {
    let nameMock: string;

    let chance: Chance.Chance;

    beforeEach(() => {
      chance = new Chance();

      nameMock = chance.string({ length: 20 });

      usersRepositoryMock.findOneBy.mockReturnValue((async () => new User())());
    });

    it('should find user that contains the name passed as argument', async () => {
      const expectedArgument: { name } = {
        name: nameMock,
      };

      await service.findOneByName(nameMock);

      expect(usersRepositoryMock.findOneBy).toBeCalledTimes(1);
      expect(usersRepositoryMock.findOneBy).toBeCalledWith(expectedArgument);
    });

    it('should return the user if it is found', async () => {
      const userMock: User = userMockFactory(chance);
      userMock.name = nameMock;
      const expectedUser: Partial<User> = {
        ...userMock,
      };
      usersRepositoryMock.findOneBy.mockReturnValue((async () => userMock)());

      const result: User = await service.findOneByName(nameMock);

      expect(result).toEqual(expectedUser);
    });

    it('should return null if the user is not found', async () => {
      usersRepositoryMock.findOneBy.mockReturnValue((async () => null)());

      const result: User = await service.findOneByName(nameMock);

      expect(result).toBeNull();
    });
  });
});
