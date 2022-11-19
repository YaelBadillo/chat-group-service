import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

import { mock } from 'jest-mock-extended';
import { Chance } from 'chance';

import { UsersService } from '../../common/services';
import { UserService } from './user.service';
import { User } from '../../entities/user.entity';
import { userMockFactory } from '../../../test/utils/entity-mocks/user.entity.mock';
import { PasswordService } from '../../shared/password';
import { UpdatePasswordResponse } from '../interfaces';

describe('UserService', () => {
  let service: UserService;
  let usersServiceMock: jest.Mocked<UsersService>;
  let passwordServiceMock: jest.Mocked<PasswordService>;

  let chance: Chance.Chance;

  beforeEach(async () => {
    usersServiceMock = mock<UsersService>();
    passwordServiceMock = mock<PasswordService>()

    chance = new Chance();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: PasswordService,
          useValue: passwordServiceMock,
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

    it('should throw if the name is already taken', async () => {
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
      delete expectedUpdatedUser.password;

      const result = await service.updateUser(
        userMock,
        newNameMock,
        newStateMock,
      );

      expect(result).toEqual(expectedUpdatedUser);
    });
  });

  describe('updatePassword method', () => {
    let userMock: User;
    let oldPasswordMock: string;
    let newPasswordMock: string;

    beforeEach(() => {
      userMock = userMockFactory(chance);
      oldPasswordMock = chance.string({ length: 15 });
      newPasswordMock = chance.string({ length: 20 });

      passwordServiceMock.compare.mockReturnValue((async () => true)());
    });

    it('should return an object with a status and a message if password was successfully updated', async () => {
      const expectedUpdatePasswordResponse: UpdatePasswordResponse = {
        status: 'ok', 
        message: 'Password has been changed',
      };

      const result: UpdatePasswordResponse = await service.updatePassword(
        userMock,
        oldPasswordMock,
        newPasswordMock,
      );

      expect(result).toEqual(expectedUpdatePasswordResponse);
    });

    it('should throw if the two old password are not equal', async () => {
      const expectedErrorMessage: string = 'Incorrect password';
      passwordServiceMock.compare.mockReturnValue((async () => false)());

      const execute = () => service.updatePassword(
        userMock,
        oldPasswordMock,
        newPasswordMock,
      );

      await expect(execute).rejects.toThrowError(BadRequestException);
      await expect(execute).rejects.toThrow(expectedErrorMessage);
    });

    it('should hash the new password', async () => {
      const expectedPassword: string = newPasswordMock;

      await service.updatePassword(
        userMock,
        oldPasswordMock,
        newPasswordMock,
      );

      expect(passwordServiceMock.encrypt).toBeCalledTimes(1);
      expect(passwordServiceMock.encrypt).toBeCalledWith(expectedPassword);
    });

    it('should update user with the new password', async () => {
      const newHashedPasswordMock: string = chance.string({ length: 20 });
      const expectedUser: User = { 
        ...userMock,
        password: newHashedPasswordMock,
      };
      passwordServiceMock.encrypt.mockReturnValue(
        (async () => newHashedPasswordMock)()
      );


      await service.updatePassword(
        userMock,
        oldPasswordMock,
        newPasswordMock,
      );

      expect(usersServiceMock.create).toBeCalledTimes(1);
      expect(usersServiceMock.create).toBeCalledWith(expectedUser);
    });
  });

  describe('deleteUser method', () => {
    let userMock: User;
    let passwordMock: string;

    beforeEach(() => {
      userMock = userMockFactory(chance);
      passwordMock = chance.string({ length: 15 });

      passwordServiceMock.compare.mockReturnValue((async () => true)());
      usersServiceMock.delete.mockReturnValue((async () => userMock)())
    });

    it('should throw if password do not match', async () => {
      const expectedErrorMessage: string = 'Incorrect password';
      passwordServiceMock.compare.mockReturnValue((async () => false)());

      const execute = () => service.deleteUser(userMock, passwordMock);

      await expect(execute).rejects.toThrowError(BadRequestException);
      await expect(execute).rejects.toThrow(expectedErrorMessage);
    });

    it('should delete the given user', async () => {
      const expectedUser: User = { ...userMock };

      await service.deleteUser(userMock, passwordMock);

      expect(usersServiceMock.delete).toBeCalledTimes(1);
      expect(usersServiceMock.delete).toBeCalledWith(expectedUser);
    });

    it('should return an object with a status and a message if user was successfully deleted', async () => {
      const result = await service.deleteUser(userMock, passwordMock);

      expect(result).toEqual({ status: 'ok', message: 'User has been successfully deleted' });
    });
  });
});
