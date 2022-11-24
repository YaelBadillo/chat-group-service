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

      channelRepositoryMock.save.mockReturnValue((async () => new Channel())());
    });

    it('should create/update channel', async () => {
      const expectedChannel: Channel = { ...channelMock };

      await service.save(channelMock);

      expect(channelRepositoryMock.save).toBeCalledTimes(1);
      expect(channelRepositoryMock.save).toBeCalledWith(expectedChannel);
    });

    it('should return the created/updated channel', async () => {
      const expectedChannel: Channel = { ...channelMock };
      channelRepositoryMock.save.mockReturnValue((async () => channelMock)());

      const result: Channel = await service.save(channelMock);

      expect(result).toEqual(expectedChannel);
    });

    it('should throw if channel could not be created or updated', async () => {
      const expectedErrorMessage = 'Channel could not be created or updated';
      channelRepositoryMock.save.mockImplementation(async () => {
        throw new Error();
      });

      const execute = async () => await service.save(channelMock);

      await expect(execute).rejects.toThrowError(InternalServerErrorException);
      await expect(execute).rejects.toThrow(expectedErrorMessage);
    });
  });

  describe('findOneByName method', () => {
    let nameMock: string;

    beforeEach(() => {
      nameMock = chance.string({ length: 15 });

      channelRepositoryMock.findOneBy.mockReturnValue(
        (async () => new Channel())(),
      );
    });

    it('should find a channel by name', async () => {
      const expectedArgument: { name: string } = { name: nameMock };

      await service.findOneByName(nameMock);

      expect(channelRepositoryMock.findOneBy).toBeCalledTimes(1);
      expect(channelRepositoryMock.findOneBy).toBeCalledWith(expectedArgument);
    });

    it('should return the found channel', async () => {
      const channelMock: Channel = channelMockFactory(chance);
      const expectedChannel: Channel = { ...channelMock };
      channelRepositoryMock.findOneBy.mockReturnValue(
        (async () => channelMock)(),
      );

      const result: Channel = await service.findOneByName(nameMock);

      expect(result).toEqual(expectedChannel);
    });

    it('should throw if the channel could not be found', async () => {
      const expectedErrorMessage = 'Channel could not be found';
      channelRepositoryMock.findOneBy.mockImplementation(async () => {
        throw new Error();
      });

      const execute = () => service.findOneByName(nameMock);

      await expect(execute).rejects.toThrowError(InternalServerErrorException);
      await expect(execute).rejects.toThrow(expectedErrorMessage);
    });
  });

  describe('findAll method', () => {
    it('should return all channels', async () => {
      const channelsMockLength = 3;
      const channelsMock: Channel[] = new Array(channelsMockLength).map(() =>
        channelMockFactory(chance),
      );
      const expectedChannels: Channel[] = channelsMock.map(
        (channel) => channel,
      );
      channelRepositoryMock.find.mockReturnValue((async () => channelsMock)());

      const result: Channel[] = await service.findAll();

      expect(result).toEqual(expectedChannels);
    });

    it('should throw if channels could not be found', async () => {
      const expectedMessage = 'Channels could not be found';
      channelRepositoryMock.find.mockImplementation(async () => {
        throw new Error();
      });

      const execute = () => service.findAll();

      await expect(execute).rejects.toThrowError(InternalServerErrorException);
      await expect(execute).rejects.toThrow(expectedMessage);
    });
  });

  describe('findOneById method', () => {
    let idMock: string;

    beforeEach(() => {
      idMock = chance.string({ length: 20 });
    });

    it('should return the channel found', async () => {
      const channelMock: Channel = channelMockFactory(chance);
      channelMock.id = idMock;
      const expectedChannel: Channel = { ...channelMock };
      channelRepositoryMock.findOneBy.mockReturnValue(
        (async () => channelMock)(),
      );

      const result: Channel = await service.findOneById(idMock);

      expect(result).toEqual(expectedChannel);
    });

    it('should throw if channel could not be found', async () => {
      const expectedErrorMessage = 'Channel could not be found';
      channelRepositoryMock.findOneBy.mockImplementation(async () => {
        throw new Error();
      });

      const execute = () => service.findOneById(idMock);

      await expect(execute).rejects.toThrowError(InternalServerErrorException);
      await expect(execute).rejects.toThrow(expectedErrorMessage);
    });
  });

  describe('remove method', () => {
    let channelMock: Channel;

    beforeEach(() => {
      channelMock = channelMockFactory(chance);

      channelRepositoryMock.remove.mockImplementation(jest.fn());
    });

    it('should delete the given channel', async () => {
      const expectedChannel: Channel = { ...channelMock };

      await service.remove(channelMock);

      expect(channelRepositoryMock.remove).toBeCalledTimes(1);
      expect(channelRepositoryMock.remove).toBeCalledWith(expectedChannel);
    });

    it('should return the removed channel', async () => {
      const expectedChannel: Channel = { ...channelMock };

      const result: Channel = await service.remove(channelMock);

      expect(result).toEqual(expectedChannel);
    });

    it('should throw if the channel could not be removed', async () => {
      const expectedMessageError = 'Channel could not be removed';
      channelRepositoryMock.remove.mockImplementation(async () => {
        throw new Error();
      });

      const execute = () => service.remove(channelMock);

      await expect(execute).rejects.toThrowError(InternalServerErrorException);
      await expect(execute).rejects.toThrow(expectedMessageError);
    });
  });
});
