import { Socket } from 'socket.io';

import { Channel, User } from '../../entities';

export type SocketWithUser = Socket & {
  user: User;
};

export type SocketWithChannel = Socket & {
  channel: Channel;
};

export type SocketWithUserAndChannel = SocketWithUser & SocketWithChannel;

export type ChannelOwnerSocket = SocketWithUser & SocketWithChannel;
