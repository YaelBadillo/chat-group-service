import { Test, TestingModule } from '@nestjs/testing';

import { mock } from 'jest-mock-extended';

import { Chance } from 'chance';

import { UserController } from './user.controller';
import { UserService } from '../services';
import { User } from '../../entities';
import { userMockFactory } from '../../../test/utils/entity-mocks';
import { UpdatePasswordDto, UpdateUserDto } from '../dto';
import { UpdatePasswordResponse } from '../interfaces';

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

  describe('updateUser method', () => {
    let newNameMock: string;
    let newStateMock: string;
    let updateUserDtoMock: UpdateUserDto;
    let userMock: User;

    beforeEach(() => {
      newNameMock = chance.name();
      newStateMock = chance.string({ length: 20 });
      updateUserDtoMock = {
        newName: newNameMock,
        newState: newStateMock,
      }
      userMock = userMockFactory(chance);
    });

    it('should update user', async () => {
      await controller.updateUser(updateUserDtoMock, userMock);

      expect(userServiceMock.updateUser).toBeCalledTimes(1);
      expect(userServiceMock.updateUser).toBeCalledWith(
        userMock, 
        updateUserDtoMock.newName,
        updateUserDtoMock.newState,
      )
    });

    it('should return the updated user', async () => {
      const updatedUserMock: User = {
        ...userMock,
      }
      updatedUserMock.name = newNameMock;
      updatedUserMock.state = newStateMock;
      const expectedUser: User = {
        ...updatedUserMock,
      }
      userServiceMock.updateUser.mockReturnValue(
        (async () => updatedUserMock)()
      );

      const result: User = await controller.updateUser(updateUserDtoMock, userMock);

      expect(result).toEqual(expectedUser);
    });
  });

  describe('updatePassword method', () => {
    let oldPasswordMock: string;
    let newPasswordMock: string;
    let updatePasswordDtoMock: UpdatePasswordDto;
    let userMock: User;

    beforeEach(() => {
      oldPasswordMock = chance.string({ length: 15 });
      newPasswordMock = chance.string({ length: 20 });
      updatePasswordDtoMock = {
        oldPassword: oldPasswordMock,
        newPassword: newPasswordMock,
        newConfirmPassword: newPasswordMock,
      };
      userMock = userMockFactory(chance);
    });

    it('should update user with the new password', async () => {
      const expectedUser: User = { ...userMock };
      const expectedOldPassword: string = oldPasswordMock;
      const expectedNewPassword: string = newPasswordMock;

      await controller.updatePassword(updatePasswordDtoMock, userMock);

      expect(userServiceMock.updatePassword).toBeCalledTimes(1);
      expect(userServiceMock.updatePassword).toBeCalledWith(
        expectedUser,
        expectedOldPassword,
        expectedNewPassword,
      );
    });

    it('should return an object with a status and a message if password was successfully updated', async () => {
      const updatePasswordResponseMock: UpdatePasswordResponse = { status: 'ok', message: '' };
      const expectedUpdatePasswordResponse = { ...updatePasswordResponseMock };
      userServiceMock.updatePassword.mockReturnValue(
        (async () => updatePasswordResponseMock)()
      );

      const result: UpdatePasswordResponse = await controller.updatePassword(updatePasswordDtoMock, userMock);

      expect(result).toEqual(expectedUpdatePasswordResponse);
    });
  });
});
