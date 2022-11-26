import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InternalServerErrorException } from '@nestjs/common';

import { Chance } from 'chance';
import { Repository } from 'typeorm';
import { mock } from 'jest-mock-extended';

import { MembersService } from './members.service';
import { Member } from '../../../entities';
import { memberMockFactory } from '../../../../test/utils/entity-mocks';

describe('MembersService', () => {
  let service: MembersService;
  let membersRepositoryMock: jest.Mocked<Repository<Member>>;

  let chance: Chance.Chance;

  beforeEach(async () => {
    chance = new Chance();
    membersRepositoryMock = mock<Repository<Member>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        {
          provide: getRepositoryToken(Member),
          useValue: membersRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
  });

  describe('save method', () => {
    let memberMock: Member;

    beforeEach(() => {
      memberMock = memberMockFactory(chance);
    });

    it('should create/update the given member', async () => {
      const expectedMember: Member = { ...memberMock };

      await service.save(memberMock);

      expect(membersRepositoryMock.save).toBeCalledTimes(1);
      expect(membersRepositoryMock.save).toBeCalledWith(expectedMember);
    });

    it('should return the updated member', async () => {
      const newMember: Partial<Member> & Member = { ...memberMock };
      const expectedMember: Member = { ...memberMock };
      membersRepositoryMock.save.mockReturnValue((async () => newMember)());

      const result: Member & Partial<Member> = await service.save(memberMock);

      expect(result).toEqual(expectedMember);
    });

    it('should throw if the given member could not be created or updated', async () => {
      const expectedErrorMessage = 'Member could not be created or updated';
      membersRepositoryMock.save.mockImplementation(async () => {
        throw new Error();
      });

      const execute = () => service.save(memberMock);

      await expect(execute).rejects.toThrowError(InternalServerErrorException);
      await expect(execute).rejects.toThrow(expectedErrorMessage);
    });
  });
});
