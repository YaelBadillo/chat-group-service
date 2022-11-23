import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

import { Chance } from 'chance';
import { mock } from 'jest-mock-extended';

import { ChannelService } from './channel.service';
import { User, Channel } from '../../entities';
import { SpaceType } from '../../common/enums';
import {
  userMockFactory,
  channelMockFactory,
} from '../../../test/utils/entity-mocks';
import { ChannelsService } from '../../common/services';
import { CreateChannelDto } from '../dto';

describe('ChannelService', () => {
  let service: ChannelService;
  let channelsServiceMock: jest.Mocked<ChannelsService>;

  let chance: Chance.Chance;

  beforeEach(async () => {
    channelsServiceMock = mock<ChannelsService>();

    chance = new Chance();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChannelService,
        {
          provide: ChannelsService,
          useValue: channelsServiceMock,
        },
      ],
    }).compile();

    service = module.get<ChannelService>(ChannelService);
  });

  describe('create method', () => {
    let userMock: User;
    let nameMock: string;
    let spaceMock: SpaceType;
    let descriptionMock: string;
    let createChannelDtoMock: CreateChannelDto;

    beforeEach(() => {
      userMock = userMockFactory(chance);
      nameMock = chance.name();
      spaceMock = SpaceType.PUBLIC;
      descriptionMock = chance.string({ length: 15 });
      createChannelDtoMock = {
        name: nameMock,
        space: spaceMock,
        description: descriptionMock,
      };
    });

    it('should throw if the channel name is already taken', async () => {
      const expectedErrorMessage = `${nameMock} name is already taken. Please choose another`;
      const foundChannelMock: Channel = channelMockFactory(chance);
      channelsServiceMock.findOneByName.mockReturnValue(
        (async () => foundChannelMock)(),
      );

      const execute = () => service.create(userMock, createChannelDtoMock);

      await expect(execute).rejects.toThrowError(BadRequestException);
      await expect(execute).rejects.toThrow(expectedErrorMessage);
    });

    it('should return the created channel', async () => {
      const expectedCreatedMock: Channel = new Channel();
      expectedCreatedMock.name = createChannelDtoMock.name;
      expectedCreatedMock.space = createChannelDtoMock.space;
      expectedCreatedMock.description = createChannelDtoMock.description;
      expectedCreatedMock.ownerId = userMock.id;
      expectedCreatedMock.createdBy = userMock.id;
      expectedCreatedMock.updatedBy = userMock.id;
      channelsServiceMock.save.mockImplementation(async (channel: Channel) => {
        return channel;
      });

      const result: Channel = await service.create(
        userMock,
        createChannelDtoMock,
      );

      expect(result).toEqual(expectedCreatedMock);
    });
  });

  describe('getAll method', () => {
    it('should return all channels', async () => {
      const channelsMockLength: number = 3;
      const channelsMock: Channel[] = new Array(channelsMockLength).map(
        () => channelMockFactory(chance),
      );
      const expectedChannels: Channel[] = channelsMock.map((channel) => channel);
      channelsServiceMock.findAll.mockReturnValue(
        (async () => channelsMock)()
      );

      const result: Channel[] = await service.getAll();

      expect(result).toEqual(expectedChannels);
    });
  });
});
