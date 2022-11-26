import { Member } from '../../../src/entities';
import { MemberRole } from '../../../src/common/enums';

export const memberMockFactory = (chance: Chance.Chance) => {
  const memberMock = new Member();
  memberMock.userId = chance.string({ length: 20 });
  memberMock.role = MemberRole.MEMBER;
  memberMock.channelId = chance.string({ length: 20 });
  memberMock.deleted = false; 
  memberMock.createdBy = chance.string({ length: 20 });
  memberMock.updatedBy = memberMock.createdBy;

  return memberMock;
};