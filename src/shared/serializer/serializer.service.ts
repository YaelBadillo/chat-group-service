import { Injectable } from '@nestjs/common';

@Injectable()
export class SerializerService {
  public async deleteProperties<T>(
    entity: T,
    properties: string[],
  ): Promise<Partial<T>> {
    properties.forEach((property) => delete entity[property]);

    return entity;
  }
}
