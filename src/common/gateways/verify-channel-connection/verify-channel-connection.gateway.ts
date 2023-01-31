import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';

import { RemoteSocket, Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

import { VerifyConnectionGateway } from '../verify-connection/verify-connection.gateway';
import { Member, User } from '../../../entities';
import { MembersService } from '../../services';
import { AddRoom, LeaveRoom, RemoveEachMember } from './interfaces';
import { SocketData } from '../../interfaces';

export abstract class VerifyChannelConnectionGateway
  extends VerifyConnectionGateway
  implements
    OnGatewayConnection,
    OnGatewayDisconnect,
    AddRoom,
    LeaveRoom,
    RemoveEachMember
{
  protected abstract readonly membersService: MembersService;

  public async handleConnection(
    client: Socket<
      DefaultEventsMap,
      DefaultEventsMap,
      DefaultEventsMap,
      SocketData
    >,
  ): Promise<void> {
    await super.handleConnection(client);

    const user: User = client.data.user;
    const userMembers: Member[] = await this.membersService.getAllByUserId(
      user.id,
    );

    userMembers.forEach(({ channelId }) => client.join(channelId));
  }

  public async handleAddRoom(userId: string, channelId: string): Promise<void> {
    const socket: RemoteSocket<DefaultEventsMap, SocketData> =
      await this.fetchUser(userId);

    socket.join(channelId);
  }

  public async handleLeaveRoom(
    userId: string,
    channelId: string,
  ): Promise<void> {
    const socket: RemoteSocket<DefaultEventsMap, SocketData> =
      await this.fetchUser(userId);

    socket.leave(channelId);
  }

  public async handleRemoveEachActiveMemberFromChannel(
    channelId: string,
  ): Promise<void> {
    const sockets: RemoteSocket<DefaultEventsMap, SocketData>[] =
      await this.server.fetchSockets();

    sockets.forEach((socket) => socket.leave(channelId));
  }

  private async fetchUser(
    userId: string,
  ): Promise<RemoteSocket<DefaultEventsMap, SocketData>> {
    const sockets: RemoteSocket<DefaultEventsMap, SocketData>[] =
      await this.server.fetchSockets();

    return sockets.filter((socket) => socket.data.user.id === userId)[0];
  }
}
