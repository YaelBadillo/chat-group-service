import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';

import { MemberService } from '../services';
import { CreateMemberDto, UpdateMemberDto } from '../dto';

@WebSocketGateway()
export class MemberGateway {
  constructor(private readonly memberService: MemberService) {}

  @SubscribeMessage('createMember')
  create(@MessageBody() createMemberDto: CreateMemberDto) {
    return this.memberService.create(createMemberDto);
  }

  @SubscribeMessage('findAllMember')
  findAll() {
    return this.memberService.findAll();
  }

  @SubscribeMessage('findOneMember')
  findOne(@MessageBody() id: number) {
    return this.memberService.findOne(id);
  }

  @SubscribeMessage('updateMember')
  update(@MessageBody() updateMemberDto: UpdateMemberDto) {
    return this.memberService.update(updateMemberDto.id, updateMemberDto);
  }

  @SubscribeMessage('removeMember')
  remove(@MessageBody() id: number) {
    return this.memberService.remove(id);
  }
}
