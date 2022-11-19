import { Module } from '@nestjs/common';
import { SerializerService } from './serializer.service';

@Module({
  providers: [SerializerService],
  exports: [SerializerService],
})
export class SerializerModule {}
