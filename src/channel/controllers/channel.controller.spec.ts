import { Test, TestingModule } from '@nestjs/testing';

import { Chance } from 'chance';
import { mock } from 'jest-mock-extended';

import { ChannelController } from './channel.controller';
import { ChannelService } from '../services';
import { Channel, User } from '../../entities';
import { CreateChannelDto } from '../dto';
import {
  userMockFactory,
  channelMockFactory,
} from '../../../test/utils/entity-mocks';
import { SpaceType } from '../../common/enums';

describe('ChannelController', () => {
  let controller: ChannelController;
  let channelServiceMock: jest.Mocked<ChannelService>;

  let chance: Chance.Chance;

  beforeEach(async () => {
    channelServiceMock = mock<ChannelService>();

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
    }).compile();

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
});
