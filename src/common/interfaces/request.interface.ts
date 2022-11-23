import { Channel, User } from '../../entities';
import { ParamsWithChannelId } from './params.interface';

export interface RequestWithUser extends Request {
  user: User;
}

export interface RequestWithParams<T> extends Request {
  params: T;
}

export interface RequestWithChannel extends Request {
  channel: Channel;
}

export interface ChannelOwnerRequest
  extends RequestWithUser,
    RequestWithParams<ParamsWithChannelId>,
    RequestWithChannel {}
