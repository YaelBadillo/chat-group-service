import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { mock } from 'jest-mock-extended';
import { Chance } from 'chance';

import { JwtStrategy } from './jwt.strategy';
import { UsersService } from '../../common/services/users/users.service';
import { User } from '../../entities/user.entity';
import { userMockFactory } from '../../../test/utils/entity-mocks/user.entity.mock';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersSpyService: jest.Mocked<UsersService>;

  let chance: Chance.Chance;

  beforeEach(async () => {
    usersSpyService = mock<UsersService>();

    chance = new Chance();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UsersService, useValue: usersSpyService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  describe('validate method', () => {
    let payload: { name: string };

    beforeEach(() => {
      payload = { name: chance.name() };

      usersSpyService.findOneByName.mockReturnValue(
        (async () => ({} as User))(),
      );
    });

    it('should throw if the user is not found', async () => {
      usersSpyService.findOneByName.mockReturnValue((async () => null)());

      const execute = async () => await strategy.validate(payload);

      await expect(execute).rejects.toThrow();
      await expect(execute).rejects.toThrowError(UnauthorizedException);
    });

    it('should return the user if found', async () => {
      const userMock: User = userMockFactory(chance);
      userMock.name = payload.name;
      const expectedUser: User = {
        ...userMock,
      };
      usersSpyService.findOneByName.mockReturnValue((async () => userMock)());

      const result: User = await strategy.validate(payload);

      expect(result).toEqual(expect.objectContaining(expectedUser));
    });
  });
});
