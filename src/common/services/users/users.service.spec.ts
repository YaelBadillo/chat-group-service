import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { mock } from 'jest-mock-extended';
import { Chance } from 'chance';

import { UsersService } from '..';
import { User } from '../../../entities';
import { userMockFactory } from '../../../../test/utils/entity-mocks';
import { InternalServerErrorException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepositoryMock: jest.Mocked<Repository<User>>;

  let chance: Chance.Chance;

  beforeEach(async () => {
    usersRepositoryMock = mock<Repository<User>>();

    chance = new Chance();

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

    it('should throw if user could not be created', async () => {
      const expectedErrorMessage = 'User could not be created';
      usersRepositoryMock.save.mockImplementation(() => {
        throw new Error();
      });

      const execute = () => service.create(userMock);

      expect(execute).toThrowError(InternalServerErrorException);
      expect(execute).toThrow(expectedErrorMessage);
    });

    it('should return the created/updated user', async () => {
      const result: User = await service.create(userMock);

      expect(result).toEqual(userMock);
    });
  });

  describe('findOneByName method', () => {
    let nameMock: string;

    beforeEach(() => {
      nameMock = chance.string({ length: 20 });

      usersRepositoryMock.findOneBy.mockReturnValue((async () => new User())());
    });

    it('should throw if user could not be found', async () => {
      const expectedErrorMessage = 'User could not be found';
      usersRepositoryMock.findOneBy.mockImplementation(() => {
        throw new Error();
      });

      const execute = () => service.findOneByName(nameMock);

      expect(execute).toThrowError(InternalServerErrorException);
      expect(execute).toThrow(expectedErrorMessage);
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

  describe('delete method', () => {
    let userMock: User;

    beforeEach(() => {
      userMock = userMockFactory(chance);
    });

    it('should return the deleted user', async () => {
      const expectedUser: User = { ...userMock };

      const result: User = await service.remove(userMock);

      expect(result).toEqual(expectedUser);
    });

    it('should throw if user could not be deleted', async () => {
      const expectedErrorMessage = 'User could not be deleted';
      usersRepositoryMock.remove.mockImplementation(() => {
        throw new Error();
      });

      const execute = () => service.remove(userMock);

      await expect(execute).rejects.toThrowError(InternalServerErrorException);
      await expect(execute).rejects.toThrow(expectedErrorMessage);
    });

    it('should delete the given user', async () => {
      const expectedUser: User = { ...userMock };

      await service.remove(userMock);

      expect(usersRepositoryMock.remove).toBeCalledTimes(1);
      expect(usersRepositoryMock.remove).toBeCalledWith(expectedUser);
    });
  });

  describe('findOneById method', () => {
    let idMock: string;

    beforeEach(() => {
      idMock = chance.string({ length: 20 });

      usersRepositoryMock.findOneBy.mockReturnValue((async () => new User())());
    });

    it('should return the found user', async () => {
      const userMock: User = userMockFactory(chance);
      userMock.id = idMock;
      const expectedUser: Partial<User> = {
        ...userMock,
      };
      usersRepositoryMock.findOneBy.mockReturnValue((async () => userMock)());

      const result: User = await service.findOneById(idMock);

      expect(result).toEqual(expectedUser);
    });

    it('should return null if the user is not found', async () => {
      usersRepositoryMock.findOneBy.mockReturnValue((async () => null)());

      const result: User = await service.findOneById(idMock);

      expect(result).toBeNull();
    });

    it('should throw if user could not be found', async () => {
      const expectedErrorMessage = 'User could not be found';
      usersRepositoryMock.findOneBy.mockImplementation(() => {
        throw new Error();
      });

      const execute = () => service.findOneById(idMock);

      await expect(execute).rejects.toThrowError(InternalServerErrorException);
      await expect(execute).rejects.toThrow(expectedErrorMessage);
    });
  });
});
