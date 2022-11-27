import { Channel, Member } from '../../entities';

export type CreateChannelResponse = {
  channel: Channel;
  ownerMember: Member;
};
