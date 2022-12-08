import { Channel } from '../../entities';

export type DataWithChannelId = {
  channelId: string;
};

export type ChannelOwnerData = DataWithChannelId & {
  channel: Channel;
};
