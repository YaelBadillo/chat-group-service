import { Test, TestingModule } from '@nestjs/testing';
import { SerializerService } from './serializer.service';

describe('SerializerService', () => {
  let service: SerializerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SerializerService],
    }).compile();

    service = module.get<SerializerService>(SerializerService);
  });

  describe('deleteProperties method', () => {
    let entityMock: { name: string; lastName: string; email: string };
    let properties: string[];

    beforeEach(() => {
      entityMock = {
        name: '',
        lastName: '',
        email: '',
      };
    });

    it('should delete the specified properties from the entity', async () => {
      properties = ['name', 'email'];
      const expectedEntity = { lastName: entityMock.lastName };

      await service.deleteProperties<object>(entityMock, properties);

      expect(entityMock).toEqual(expectedEntity);
    });

    it('should return the entity without the specified properties', async () => {
      properties = ['lastName', 'email'];
      const expectedEntity = { name: entityMock.name };

      const result = await service.deleteProperties<object>(
        entityMock,
        properties,
      );

      expect(result).toEqual(expectedEntity);
    });
  });
});
