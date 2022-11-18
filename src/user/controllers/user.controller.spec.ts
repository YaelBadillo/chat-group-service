import { Test, TestingModule } from '@nestjs/testing';

import { mock } from 'jest-mock-extended';

import { Chance } from 'chance';

import { UserController } from './user.controller';
import { UserService } from '../services';
import { User } from '../../entities';
import { userMockFactory } from '../../../test/utils/entity-mocks';

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
        }
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });


  describe('getUser method', () => {
    it('should return user', () => {
      const userMock: User = userMockFactory(chance);
      const expectedUser: User = { ...userMock };

      const result: User = controller.getUser(userMock);

      expect(result).toEqual(expectedUser);
    });
  });
});
