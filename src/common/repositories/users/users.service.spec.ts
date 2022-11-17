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

    it('should return the created/updated user', async () => {
      const result: User = await service.create(userMock);

      expect(result).toEqual(userMock);
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

    it('should return the found user', async () => {
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
