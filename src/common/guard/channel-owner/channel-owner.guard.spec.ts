import { TestingModule, Test } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { HttpArgumentsHost, WsArgumentsHost } from '@nestjs/common/interfaces';

import { Chance } from 'chance';
import { mock } from 'jest-mock-extended';

import { ChannelOwnerGuard } from './channel-owner.guard';
import { Channel, User } from '../../../entities';
import {
  userMockFactory,
  channelMockFactory,
} from '../../../../test/utils/entity-mocks';
import { ChannelOwnerRequest } from '../../interfaces';
import { ChannelOwnerSocket } from '../../types';

describe('ChannelOwnerGuard', () => {
  let guard: ChannelOwnerGuard;

  let chance: Chance.Chance;

  beforeEach(async () => {
    chance = new Chance();

    const module: TestingModule = await Test.createTestingModule({
      providers: [ChannelOwnerGuard],
    }).compile();

    guard = module.get<ChannelOwnerGuard>(ChannelOwnerGuard);
  });

  describe('canActivate method', () => {
    let userMock: User;
    let channelMock: Channel;
    let contextMock: jest.Mocked<ExecutionContext>;

    beforeEach(() => {
      userMock = userMockFactory(chance);
      channelMock = channelMockFactory(chance);
      contextMock = mock<ExecutionContext>();
    });

    describe('with HTTP', () => {
      let requestMock: ChannelOwnerRequest;
      let httpArgumentsHostMock: jest.Mocked<HttpArgumentsHost>;

      beforeEach(() => {
        requestMock = mock<ChannelOwnerRequest>();
        httpArgumentsHostMock = mock<HttpArgumentsHost>();

        requestMock.user = userMock;
        requestMock.channel = channelMock;

        httpArgumentsHostMock.getRequest.mockReturnValue(requestMock);
        contextMock.switchToHttp.mockReturnValue(httpArgumentsHostMock);

        contextMock.getType.mockReturnValue('http');
      });

      it('should throw if the user does not own the channel', () => {
        const expectedErrorMessage = 'You are not the owner of this channel';

        const execute = () => guard.canActivate(contextMock);

        expect(execute).toThrowError(UnauthorizedException);
        expect(execute).toThrow(expectedErrorMessage);
      });

      it('should true if user is the owner of the channel', () => {
        userMock.id = channelMock.ownerId;

        const result: boolean = guard.canActivate(contextMock);

        expect(result).toBeTruthy();
      });
    });

    describe('with WS', () => {
      let clientMock: ChannelOwnerSocket;
      let wsArgumentsHostMock: jest.Mocked<WsArgumentsHost>;

      beforeEach(() => {
        clientMock = mock<ChannelOwnerSocket>();
        wsArgumentsHostMock = mock<WsArgumentsHost>();

        clientMock.user = userMock;
        clientMock.channel = channelMock;

        wsArgumentsHostMock.getClient.mockReturnValue(clientMock);
        contextMock.switchToWs.mockReturnValue(wsArgumentsHostMock);

        contextMock.getType.mockReturnValue('ws');
      });

      it('should throw if the user does not own the channel', async () => {
        const expectedErrorMessage = 'You are not the owner of this channel';

        const execute = () => guard.canActivate(contextMock);

        expect(execute).toThrowError(UnauthorizedException);
        expect(execute).toThrow(expectedErrorMessage);
      });

      it('should true if user is the owner of the channel', () => {
        userMock.id = channelMock.ownerId;

        const result: boolean = guard.canActivate(contextMock);

        expect(result).toBeTruthy();
      });
    });
  });
});
