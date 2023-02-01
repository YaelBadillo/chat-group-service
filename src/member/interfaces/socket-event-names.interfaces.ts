import { Member } from '../../entities';

export interface ServerToClientEvents {
  handleInvitation: (invitation: Member) => void;
  handleNewMember: (member: Member) => void;
  handleRequestToJoin: (requestOJoin: Member) => void;
}
