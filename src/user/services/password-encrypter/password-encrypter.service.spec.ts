import { Test, TestingModule } from '@nestjs/testing';

import { Chance } from 'chance';
import * as bcrypt from 'bcrypt';

import { PasswordEncrypterService } from '../.';

describe('PasswordService', () => {
  let service: PasswordEncrypterService;

  let chance: Chance.Chance;

  beforeEach(async () => {
    chance = new Chance();

    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordEncrypterService],
    }).compile();

    service = module.get<PasswordEncrypterService>(PasswordEncrypterService);
  });

  describe('encrypt method', () => {
    let passwordMock: string;
    let hashedPasswordMock: string;
    let saltRoundsMock: number;

    beforeEach(() => {
      passwordMock = chance.string({ length: 20 });
      hashedPasswordMock = chance.string({ length: 20 });
      saltRoundsMock = 12;

      jest.spyOn(bcrypt, 'hash').mockImplementation(() => {
        return hashedPasswordMock;
      });
    });

    it('should encrypt password', async () => {
      await service.encrypt(passwordMock);

      expect(bcrypt.hash).toBeCalledTimes(1);
      expect(bcrypt.hash).toBeCalledWith(passwordMock, saltRoundsMock);
    });

    it('should return hashed password', async () => {
      const result: string = await service.encrypt(passwordMock);

      expect(result).toBe(hashedPasswordMock);
    });
  });

  describe('decrypt method', () => {
    let passwordMock: string;
    let hashedPasswordMock: string;

    beforeEach(() => {
      passwordMock = chance.string({ length: 20 });
      hashedPasswordMock = chance.string({ length: 20 });

      jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);
    });

    it('should compare password and hashed password', async () => {
      await service.decrypt(passwordMock, hashedPasswordMock);

      expect(bcrypt.compare).toBeCalledTimes(1);
      expect(bcrypt.compare).toBeCalledWith(passwordMock, hashedPasswordMock);
    });

    it('should return true if if password and hashed password are equal', async () => {
      const result: boolean = await service.decrypt(
        passwordMock,
        hashedPasswordMock,
      );

      expect(result).toBeTruthy();
    });

    it('should return false if password and hashed password are not equal', async () => {
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => false);

      const result: boolean = await service.decrypt(
        passwordMock,
        hashedPasswordMock,
      );

      expect(result).not.toBeTruthy();
    });
  });
});
