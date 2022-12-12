import { TestingModule, Test } from '@nestjs/testing';
import {
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { WsArgumentsHost } from '@nestjs/common/interfaces';

import { mock } from 'jest-mock-extended';
import { Chance } from 'chance';

import { AttachChannelInterceptor } from './attach-channel.interceptor';
import { ChannelsService } from '../../services';
import { DataWithChannelId, SocketWithChannel } from '../../types';
import { Channel } from '../../../entities';
import { channelMockFactory } from '../../../../test/utils/entity-mocks';

describe('AttachChannelInterceptor', () => {
  let interceptor: AttachChannelInterceptor;
  let channelsServiceMock: jest.Mocked<ChannelsService>;

  let chance: Chance.Chance;

  beforeEach(async () => {
    channelsServiceMock = mock<ChannelsService>();

    chance = new Chance();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttachChannelInterceptor,
        {
          provide: ChannelsService,
          useValue: channelsServiceMock,
        },
      ],
    }).compile();

    interceptor = module.get<AttachChannelInterceptor>(
      AttachChannelInterceptor,
    );
  });

  describe('intercept method', () => {
    let contextMock: jest.Mocked<ExecutionContext>;
    let nextMock: CallHandler;
    let channelIdMock: string;
    let clientMock: SocketWithChannel;

    beforeEach(() => {
      contextMock = mock<ExecutionContext>();
      nextMock = mock<CallHandler>();
      channelIdMock = chance.string({ length: 20 });
      clientMock = mock<SocketWithChannel>();
    });

    describe('with ws', () => {
      let wsArgumentsHostMock: jest.Mocked<WsArgumentsHost>;
      let dataMock: DataWithChannelId;

      beforeEach(() => {
        wsArgumentsHostMock = mock<WsArgumentsHost>();
        dataMock = {
          channelId: channelIdMock,
        };

        wsArgumentsHostMock.getClient.mockReturnValue(clientMock);
        wsArgumentsHostMock.getData.mockReturnValue(dataMock);
        contextMock.switchToWs.mockReturnValue(wsArgumentsHostMock);
        contextMock.getType.mockReturnValue('ws');
      });

      it('should throw if there is no channel with the given channel id', async () => {
        const expectedErrorMessage =
          'There is no channel with the given channel id';
        channelsServiceMock.findOneById.mockReturnValue((async () => null)());

        const execute = () => interceptor.intercept(contextMock, nextMock);

        await expect(execute).rejects.toThrowError(BadRequestException);
        await expect(execute).rejects.toThrow(expectedErrorMessage);
      });

      it('should attach the channel to the client object', async () => {
        const channelMock: Channel = channelMockFactory(chance);
        const expectedChannel: Channel = { ...channelMock };
        channelsServiceMock.findOneById.mockReturnValue(
          (async () => channelMock)(),
        );

        await interceptor.intercept(contextMock, nextMock);

        expect(clientMock.channel).toEqual(expectedChannel);
      });
    });
  });
});
