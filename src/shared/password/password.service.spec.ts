import { Test, TestingModule } from '@nestjs/testing';

import { Chance } from 'chance';
import * as bcrypt from 'bcrypt';

import { PasswordService } from './password.service';
import { InternalServerErrorException } from '@nestjs/common';

describe('PasswordService', () => {
  let service: PasswordService;

  let chance: Chance.Chance;

  beforeEach(async () => {
    chance = new Chance();

    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  describe('encrypt method', () => {
    let passwordMock: string;
    let hashedPasswordMock: string;

    beforeEach(() => {
      passwordMock = chance.string({ length: 20 });
      hashedPasswordMock = chance.string({ length: 20 });

      jest.spyOn(bcrypt, 'hash').mockImplementation(() => {
        return hashedPasswordMock;
      });
    });

    it('should throw if password could not be hashed', () => {
      const expectedErrorMessage = 'Password could not be encrypted';
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => {
        throw new Error();
      });

      const execute = () => service.encrypt(passwordMock);

      expect(execute).toThrowError(InternalServerErrorException);
      expect(execute).toThrow(expectedErrorMessage);
    });

    it('should return hashed password', async () => {
      const result: string = await service.encrypt(passwordMock);

      expect(result).toBe(hashedPasswordMock);
    });
  });

  describe('compare method', () => {
    let passwordMock: string;
    let hashedPasswordMock: string;

    beforeEach(() => {
      passwordMock = chance.string({ length: 20 });
      hashedPasswordMock = chance.string({ length: 20 });

      jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);
    });

    it('should throw if passwords could not be encrypted', async () => {
      const expectedErrorMessage = 'Passwords could not be compared';
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => {
        throw new Error();
      });

      const execute = () => service.compare(passwordMock, hashedPasswordMock);

      expect(execute).toThrowError(InternalServerErrorException);
      expect(execute).toThrow(expectedErrorMessage);
    });

    it('should return true if passwords match', async () => {
      const result: boolean = await service.compare(
        passwordMock,
        hashedPasswordMock,
      );

      expect(result).toBeTruthy();
    });

    it('should return false if passwords do not match', async () => {
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => false);

      const result: boolean = await service.compare(
        passwordMock,
        hashedPasswordMock,
      );

      expect(result).not.toBeTruthy();
    });
  });
});
