import { Channel } from '../../entities';

export interface ServerToClientEvents {
  handleUpdate: (updatedChannel: Channel) => void;
  handleDelete: (deletedChannel: Channel) => void;
}
