import { Channel } from '../../../src/entities';

export const channelMockFactory = (chance: Chance.Chance) => {
  const channelMock = new Channel();
  channelMock.name = chance.name();
  channelMock.description = chance.string({ length: 255 });
  channelMock.ownerId = chance.string({ length: 100 });
  channelMock.createdBy = chance.string({ length: 100 });
  channelMock.updatedBy = chance.string({ length: 100 });

  return channelMock;
};