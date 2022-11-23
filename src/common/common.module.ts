import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User, Channel } from '../entities';
import { UsersService, ChannelsService } from './services';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User, Channel])],
  providers: [UsersService, ChannelsService],
  exports: [UsersService, ChannelsService],
})
export class CommonModule {}
