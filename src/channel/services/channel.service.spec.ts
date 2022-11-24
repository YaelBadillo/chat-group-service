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
import { CreateChannelDto, DeleteChannelDto, UpdateChannelDto } from '../dto';
import { PasswordService } from '../../shared/password';
import { StatusResponse } from '../../common/interfaces';

describe('ChannelService', () => {
  let service: ChannelService;
  let channelsServiceMock: jest.Mocked<ChannelsService>;
  let passwordServiceMock: jest.Mocked<PasswordService>;

  let chance: Chance.Chance;

  beforeEach(async () => {
    channelsServiceMock = mock<ChannelsService>();
    passwordServiceMock = mock<PasswordService>();

    chance = new Chance();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChannelService,
        {
          provide: ChannelsService,
          useValue: channelsServiceMock,
        },
        {
          provide: PasswordService,
          useValue: passwordServiceMock,
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
      const channelsMockLength = 3;
      const channelsMock: Channel[] = new Array(channelsMockLength).map(() =>
        channelMockFactory(chance),
      );
      const expectedChannels: Channel[] = channelsMock.map(
        (channel) => channel,
      );
      channelsServiceMock.findAll.mockReturnValue((async () => channelsMock)());

      const result: Channel[] = await service.getAll();

      expect(result).toEqual(expectedChannels);
    });
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
      descriptionMock = chance.string({ length: 15 });
      updateChannelDtoMock = {
        name: nameMock,
        space: spaceMock,
        description: descriptionMock,
      };
    });

    it('should return the updated channel', async () => {
      const expectedUpdatedChannel: Channel = { ...channelMock };
      expectedUpdatedChannel.name = nameMock;
      expectedUpdatedChannel.space = spaceMock;
      expectedUpdatedChannel.description = descriptionMock;
      channelsServiceMock.save.mockImplementation(async (channel: Channel) => {
        return channel;
      });

      const result: Channel = await service.update(
        channelMock,
        updateChannelDtoMock,
      );

      expect(result).toEqual(expectedUpdatedChannel);
    });
  });

  describe('delete method', () => {
    let userMock: User;
    let channelMock: Channel;
    let passwordMock: string;
    let deleteChannelDtoMock: DeleteChannelDto;

    beforeEach(() => {
      userMock = userMockFactory(chance);
      channelMock = channelMockFactory(chance);
      passwordMock = userMock.password;
      deleteChannelDtoMock = { password: passwordMock };

      passwordServiceMock.compare.mockReturnValue((async () => true)());
      channelsServiceMock.remove.mockReturnValue((async () => new Channel())());
    });

    it('should throw if the password do not match', async () => {
      const expectedErrorMessage = 'Incorrect password';
      passwordMock = chance.string({ length: 20 });
      passwordServiceMock.compare.mockReturnValue((async () => false)());

      const execute = () =>
        service.delete(userMock, channelMock, deleteChannelDtoMock);

      await expect(execute).rejects.toThrowError(BadRequestException);
      await expect(execute).rejects.toThrow(expectedErrorMessage);
    });

    it('should remove the given channel', async () => {
      const expectedChannel: Channel = { ...channelMock };

      await service.delete(userMock, channelMock, deleteChannelDtoMock);

      expect(channelsServiceMock.remove).toBeCalledTimes(1);
      expect(channelsServiceMock.remove).toBeCalledWith(expectedChannel);
    });

    it('should return an object with a status and a message if the channel was successfully removed', async () => {
      const expectedStatusResponse: StatusResponse = {
        status: 'ok',
        message: `The channel ${channelMock.name} was successfully deleted`,
      };

      const result: StatusResponse = await service.delete(
        userMock,
        channelMock,
        deleteChannelDtoMock,
      );

      expect(result).toEqual(expectedStatusResponse);
    });
  });
});
