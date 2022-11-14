import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { mock } from 'jest-mock-extended';

import { UsersService } from '../.';
import { User } from '../../../entities';

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

    beforeEach(() => {
      userMock = mock<User>();

      usersRepositoryMock.save.mockReturnValue((async () => userMock)());
    });

    it('should save the user passed as argument', async () => {
      await service.create(userMock);

      expect(usersRepositoryMock.save).toBeCalledTimes(1);
    });

    it('should return a user', async () => {
      const result: User = await service.create(userMock);

      expect(result).toEqual(userMock);
    });
  });
});
