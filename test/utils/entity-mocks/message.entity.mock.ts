import { Message } from '../../../src/entities';

export const messageMockFactory = (chance: Chance.Chance) => {
  const messageMock = new Message();
  messageMock.content = chance.string({ length: 15 });
  messageMock.messageIdToReply = chance.string({ length: 20 });

  return messageMock;
};