import { Message } from '../../entities';

export interface ClientToServerEvents {
  createMessage: () => void;
}

export interface ServerToClientEvents {
  handleMessage: (message: Message) => void;
  handleDeletedMessage: (messageId: string) => void;
}
