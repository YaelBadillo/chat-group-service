import { Socket } from 'socket.io';

import { User } from '../../entities';

export type DataWithUser = {
  user: User;
};

export type SocketWithUser = Socket & {
  data: DataWithUser;
};
