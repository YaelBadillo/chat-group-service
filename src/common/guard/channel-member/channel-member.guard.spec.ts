import { ExecutionContext, BadRequestException } from '@nestjs/common';
import { HttpArgumentsHost, WsArgumentsHost } from '@nestjs/common/interfaces';
import { Test, TestingModule } from '@nestjs/testing';

import { mock } from 'jest-mock-extended';
import { Chance } from 'chance';

import { ChannelMemberGuard } from './channel-member.guard';
import { ChannelsService } from '../../services';
import { User, Channel } from '../../../entities';
import {
  userMockFactory,
  channelMockFactory,
} from '../../../../test/utils/entity-mocks';
import { ChannelOwnerRequest } from '../../interfaces';
import { ChannelOwnerData, ChannelOwnerSocket } from '../../types';

describe('ChannelOwnerGuard', () => {
  let guard: ChannelMemberGuard;
  let channelsServiceMock: jest.Mocked<ChannelsService>;

  let chance: Chance.Chance;

  beforeEach(async () => {
    channelsServiceMock = mock<ChannelsService>();

    chance = new Chance();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChannelMemberGuard,
        {
          provide: ChannelsService,
          useValue: channelsServiceMock,
        },
      ],
    }).compile();

    guard = module.get<ChannelMemberGuard>(ChannelMemberGuard);
  });

  describe('canActivate method', () => {
    let contextMock: jest.Mocked<ExecutionContext>;
    let channelIdMock: string;
    let userMock: User;
    let channelMock: Channel;

    beforeEach(() => {
      contextMock = mock<ExecutionContext>();
      channelIdMock = chance.string({ length: 20 });
      userMock = userMockFactory(chance);
      userMock.id = chance.string({ length: 20 });
      channelMock = channelMockFactory(chance);
      channelMock.ownerId = userMock.id;

      channelsServiceMock.findOneById.mockReturnValue(
        (async () => new Channel())(),
      );
    });

    describe('with HTTP protocol', () => {
      let httpArgumentsHostMock: jest.Mocked<HttpArgumentsHost>;
      let requestMock: jest.Mocked<ChannelOwnerRequest>;

      beforeEach(() => {
        httpArgumentsHostMock = mock<HttpArgumentsHost>();
        requestMock = mock<ChannelOwnerRequest>();

        requestMock.user = userMock;
        requestMock.params = { channelId: channelIdMock };

        httpArgumentsHostMock.getRequest.mockReturnValue(requestMock);
        contextMock.switchToHttp.mockReturnValue(httpArgumentsHostMock);

        contextMock.getType.mockReturnValue('http');
      });

      it('should throw if the channel does not exits', async () => {
        const expectedErrorMessage = 'Channel does not exists';
        channelsServiceMock.findOneById.mockReturnValue((async () => null)());

        const execute = () => guard.canActivate(contextMock);

        await expect(execute).rejects.toThrowError(BadRequestException);
        await expect(execute).rejects.toThrow(expectedErrorMessage);
      });

      it('should attach channel to the request object', async () => {
        const expectedChannel: Channel = { ...channelMock };
        channelsServiceMock.findOneById.mockReturnValue(
          (async () => channelMock)(),
        );

        await guard.canActivate(contextMock);

        expect(requestMock.channel).toEqual(expectedChannel);
      });

      it('should return true if user is owner of the channel', async () => {
        channelsServiceMock.findOneById.mockReturnValue(
          (async () => channelMock)(),
        );

        const result: boolean = await guard.canActivate(contextMock);

        expect(result).toBeTruthy();
      });
    });

    describe('with WS protocol', () => {
      let wsArgumentsHostMock: jest.Mocked<WsArgumentsHost>;
      let clientMock: jest.Mocked<ChannelOwnerSocket>;
      let dataMock: jest.Mocked<ChannelOwnerData>;

      beforeEach(() => {
        wsArgumentsHostMock = mock<WsArgumentsHost>();
        clientMock = mock<ChannelOwnerSocket>();
        dataMock = {
          channelId: channelIdMock,
        };

        clientMock.user = userMock;
        clientMock.data = dataMock;

        contextMock.switchToWs.mockReturnValue(wsArgumentsHostMock);
        wsArgumentsHostMock.getClient.mockReturnValue(clientMock);
        wsArgumentsHostMock.getData.mockReturnValue(dataMock);

        contextMock.getType.mockReturnValue('ws');
      });

      it('should throw if no channel id is provided', async () => {
        const expectedErrorMessage = 'Please provide a channel id';
        dataMock.channelId = '';

        const execute = () => guard.canActivate(contextMock);

        await expect(execute).rejects.toThrowError(BadRequestException);
        await expect(execute).rejects.toThrow(expectedErrorMessage);
      });

      it('should throw if channel id variable is an array of strings', async () => {
        const expectedErrorMessage =
          'The userId query parameter should be a string';
        clientMock.handshake.query = {
          channelId: ['', ''],
        };
        dataMock.channelId = '';

        const execute = () => guard.canActivate(contextMock);

        await expect(execute).rejects.toThrowError(BadRequestException);
        await expect(execute).rejects.toThrow(expectedErrorMessage);
      });

      it('should throw if the channel does not exits', async () => {
        const expectedErrorMessage = 'Channel does not exists';
        channelsServiceMock.findOneById.mockReturnValue((async () => null)());

        const execute = () => guard.canActivate(contextMock);

        await expect(execute).rejects.toThrowError(BadRequestException);
        await expect(execute).rejects.toThrow(expectedErrorMessage);
      });

      it('should attach channel to the client object', async () => {
        const expectedChannel: Channel = { ...channelMock };
        channelsServiceMock.findOneById.mockReturnValue(
          (async () => channelMock)(),
        );

        await guard.canActivate(contextMock);

        expect(clientMock.channel).toEqual(expectedChannel);
      });

      it('should return true if user is owner of the channel', async () => {
        channelsServiceMock.findOneById.mockReturnValue(
          (async () => channelMock)(),
        );

        const result: boolean = await guard.canActivate(contextMock);

        expect(result).toBeTruthy();
      });
    });
  });
});
