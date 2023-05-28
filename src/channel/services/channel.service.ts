import { Injectable, BadRequestException } from '@nestjs/common';

import { User, Channel, Member } from '../../entities';
import { ChannelsService, MembersService } from '../../common/services';
import { CreateChannelDto, DeleteChannelDto, UpdateChannelDto } from '../dto';
import { PasswordService } from '../../shared/password';
import { StatusResponse } from '../../common/interfaces';
import { CreateChannelResponse } from '../types';
import { MemberBuilderService } from '../../common/entities/builders';
import { MemberDirectorService } from '../../common/entities/directors';

@Injectable()
export class ChannelService {
  constructor(
    private readonly channelsService: ChannelsService,
    private readonly membersService: MembersService,
    private readonly passwordService: PasswordService,
    private readonly memberBuilderService: MemberBuilderService,
    private readonly memberDirectorService: MemberDirectorService,
  ) {
    this.memberDirectorService.setBuilder(this.memberBuilderService);
  }

  public async create(
    user: User,
    createChannelDto: CreateChannelDto,
  ): Promise<CreateChannelResponse> {
    const channel: Channel = await this.channelsService.findOneByName(
      createChannelDto.name,
    );
    if (channel)
      throw new BadRequestException(
        `${createChannelDto.name} name is already taken. Please choose another`,
      );

    const channelInstance: Channel = this.createChannelInstance(
      user,
      createChannelDto,
    );

    const newChannel: Channel = await this.channelsService.save(
      channelInstance,
    );

    this.memberDirectorService.buildOwnerInstance(user.id, newChannel.id);
    const ownerInstance: Member = this.memberBuilderService.getResult();

    const ownerMember: Member = await this.membersService.save(ownerInstance);

    return { channel: newChannel, ownerMember };
  }

  public getAll(): Promise<Channel[]> {
    return this.channelsService.findAll();
  }

  public async getAllByUser(userId: string): Promise<Channel[]> {
    const usersMembers: Member[] = await this.membersService.getAllByUserId(
      userId,
    );

    const usersChannels: Channel[] = await Promise.all(
      usersMembers.map(({ channelId }: Member) =>
        this.channelsService.findOneById(channelId),
      ),
    );

    return usersChannels;
  }

  public update(
    channel: Channel,
    updateChannelDto: UpdateChannelDto,
  ): Promise<Channel> {
    this.updateChannelInstance(channel, updateChannelDto);

    return this.channelsService.save(channel);
  }

  public async delete(
    user: User,
    channel: Channel,
    deleteChannelDto: DeleteChannelDto,
  ): Promise<StatusResponse> {
    const areEqual: boolean = await this.passwordService.compare(
      deleteChannelDto.password,
      user.password,
    );
    if (!areEqual) throw new BadRequestException('Incorrect password');

    await this.channelsService.remove(channel);

    return {
      status: 'ok',
      message: `The channel ${channel.name} has been successfully deleted`,
    };
  }

  private createChannelInstance(
    user: User,
    { name, space, description }: CreateChannelDto,
  ): Channel {
    const channelInstance = new Channel();
    channelInstance.name = name;
    channelInstance.space = space;
    channelInstance.description = description;
    channelInstance.ownerId = user.id;
    channelInstance.createdBy = user.id;
    channelInstance.updatedBy = user.id;

    return channelInstance;
  }

  private updateChannelInstance(
    channel: Channel,
    updateChannelDto: UpdateChannelDto,
  ): Channel {
    channel.name = updateChannelDto.name;
    channel.space = updateChannelDto.space;
    channel.description = updateChannelDto.description;

    return channel;
  }
}
