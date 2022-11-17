import { Chance } from 'chance';

import { User } from '../../../src/entities';

export const userMockFactory = (chance: Chance.Chance) => {
  const userMock = new User();
  userMock.name = chance.string({ length: 20 });
  userMock.state = chance.string({ length: 255 });
  userMock.password = chance.string({ length: 255 });

  return userMock;
};
