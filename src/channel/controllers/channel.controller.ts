import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';

import {
  ChannelOwner,
  Public,
  UserFromRequest,
  ChannelFromRequest,
} from '../../common/decorators';
import { ChannelService } from '../services';
import { Channel, User } from '../../entities';
import { CreateChannelDto, UpdateChannelDto, DeleteChannelDto } from '../dto';
import { StatusResponse } from '../../common/interfaces';
import { CreateChannelResponse } from '../types';
import { ChannelGateway } from '../gateways';

@Controller('channel')
export class ChannelController {
  constructor(
    private readonly channelService: ChannelService,
    private readonly channelGateway: ChannelGateway,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  public createChannel(
    @UserFromRequest() user: User,
    @Body() createChannelDto: CreateChannelDto,
  ): Promise<CreateChannelResponse> {
    return this.channelService.create(user, createChannelDto);
  }

  @Get()
  @Public()
  @HttpCode(HttpStatus.OK)
  public getAll(): Promise<Channel[]> {
    return this.channelService.getAll();
  }

  @Patch(':channelId')
  @HttpCode(HttpStatus.OK)
  @ChannelOwner()
  public async update(
    @ChannelFromRequest() channel: Channel,
    @Body() updateChannelDto: UpdateChannelDto,
  ): Promise<Channel> {
    const updatedChannel: Channel = await this.channelService.update(
      channel,
      updateChannelDto,
    );

    this.channelGateway.notifyUpdateToEachActiveMembers(updatedChannel);

    return updatedChannel;
  }

  @Delete(':channelId')
  @HttpCode(HttpStatus.OK)
  @ChannelOwner()
  public async delete(
    @UserFromRequest() user: User,
    @ChannelFromRequest() channel: Channel,
    @Body() deleteChannelDto: DeleteChannelDto,
  ): Promise<StatusResponse> {
    const statusResponse: StatusResponse = await this.channelService.delete(
      user,
      channel,
      deleteChannelDto,
    );

    this.channelGateway.notifyDeleteToEachActiveMembers(channel);

    return statusResponse;
  }
}
