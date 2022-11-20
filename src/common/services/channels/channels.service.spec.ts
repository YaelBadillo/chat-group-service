import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InternalServerErrorException } from '@nestjs/common';

import { Repository } from 'typeorm';
import { Chance } from 'chance';
import { mock } from 'jest-mock-extended';

import { ChannelsService } from './channels.service';
import { Channel } from '../../../entities';
import { channelMockFactory } from '../../../../test/utils/entity-mocks';

describe('ChannelsService', () => {
  let service: ChannelsService;
  let channelRepositoryMock: jest.Mocked<Repository<Channel>>;

  let chance: Chance.Chance;

  beforeEach(async () => {
    channelRepositoryMock = mock<Repository<Channel>>();

    chance = new Chance();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChannelsService,
        {
          provide: getRepositoryToken(Channel),
          useValue: channelRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<ChannelsService>(ChannelsService);
  });

  describe('save method', () => {
    let channelMock: Channel;

    beforeEach(() => {
      channelMock = channelMockFactory(chance);

      channelRepositoryMock.save.mockReturnValue(
        (async () => new Channel())()
      );
    });

    it('should create/update channel', async () => {
      const expectedChannel: Channel = { ...channelMock };

      await service.save(channelMock);

      expect(channelRepositoryMock.save).toBeCalledTimes(1);
      expect(channelRepositoryMock.save).toBeCalledWith(expectedChannel);
    });

    it('should return the created/updated channel', async () => {
      const expectedChannel: Channel = { ...channelMock };
      channelRepositoryMock.save.mockReturnValue(
        (async () => channelMock)()
      );

      const result: Channel = await service.save(channelMock);

      expect(result).toEqual(expectedChannel);
    });

    it('should throw if channel could not be created or updated', async () => {
      const expectedErrorMessage: string = 'Channel could not be created or updated';
      channelRepositoryMock.save.mockImplementation(() => {
        throw new Error();
      });

      const execute = async () => await service.save(channelMock);

      await expect(execute).rejects.toThrowError(InternalServerErrorException);
      await expect(execute).rejects.toThrow(expectedErrorMessage);
    });
  });
});
