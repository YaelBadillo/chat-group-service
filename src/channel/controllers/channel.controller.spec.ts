import { Test, TestingModule } from '@nestjs/testing';

import { Chance } from 'chance';
import { mock } from 'jest-mock-extended';

import { ChannelController } from './channel.controller';
import { ChannelService } from '../services';
import { Channel, User } from '../../entities';
import { CreateChannelDto, UpdateChannelDto } from '../dto';
import {
  userMockFactory,
  channelMockFactory,
} from '../../../test/utils/entity-mocks';
import { SpaceType } from '../../common/enums';
import { ChannelOwnerGuard } from '../../common/guard';

describe('ChannelController', () => {
  let controller: ChannelController;
  let channelServiceMock: jest.Mocked<ChannelService>;
  let channelOwnerGuardMock: jest.Mocked<ChannelOwnerGuard>

  let chance: Chance.Chance;

  beforeEach(async () => {
    channelServiceMock = mock<ChannelService>();
    channelOwnerGuardMock = mock<ChannelOwnerGuard>();

    chance = new Chance();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChannelController],
      providers: [
        ChannelService,
        {
          provide: ChannelService,
          useValue: channelServiceMock,
        },
      ],
    })
      .overrideGuard(ChannelOwnerGuard)
      .useValue(channelOwnerGuardMock)
      .compile();

    controller = module.get<ChannelController>(ChannelController);
  });

  describe('createChannel method', () => {
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

    it('should return the created channel', async () => {
      const channelMock: Channel = channelMockFactory(chance);
      channelMock.name = nameMock;
      channelMock.space = spaceMock;
      channelMock.description = descriptionMock;
      channelMock.ownerId = userMock.id;
      channelMock.createdBy = userMock.id;
      channelMock.updatedBy = userMock.id;
      const expectedChannel: Channel = { ...channelMock };
      channelServiceMock.create.mockReturnValue((async () => channelMock)());

      const result: Channel = await controller.createChannel(
        userMock,
        createChannelDtoMock,
      );

      expect(result).toEqual(expectedChannel);
    });
  });

  describe('getAll method', () => {
    it('should return all channels', async () => {
      const channelsMockLength: number = 3;
      const channelsMock: Channel[] = new Array(channelsMockLength).map(
        () => channelMockFactory(chance),
      );
      const expectedChannels: Channel[] = channelsMock.map((channel) => channel);
      channelServiceMock.getAll.mockReturnValue(
        (async () => channelsMock)(),
      );

      const result: Channel[] = await controller.getAll();

      expect(result).toEqual(expectedChannels);
    })
  });

  describe('update method', () => {
    let channelMock: Channel;
    let nameMock: string;
    let spaceMock: SpaceType;
    let descriptionMock: string;
    let updateChannelDtoMock: UpdateChannelDto;

    beforeEach(() => {
      channelMock = channelMockFactory(chance);
      nameMock = chance.name();
      spaceMock = SpaceType.PRIVATE;
      descriptionMock = chance.string({ length: 20 });
      updateChannelDtoMock = {
        name: nameMock,
        space: spaceMock,
        description: descriptionMock,
      };
    });

    it('should return the updated channel', async () => {
      const updatedChannelMock: Channel = channelMockFactory(chance);
      updatedChannelMock.name = updateChannelDtoMock.name;
      updatedChannelMock.space = updateChannelDtoMock.space;
      updatedChannelMock.description = updateChannelDtoMock.description;
      const expectedUpdatedChannel: Channel = { ...updatedChannelMock };
      channelServiceMock.update.mockReturnValue(
        (async () => updatedChannelMock)(),
      );

      const result: Channel = await controller.update(channelMock, updateChannelDtoMock);

      expect(result).toEqual(expectedUpdatedChannel);
    });
  });
});
