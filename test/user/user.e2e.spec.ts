import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';

import * as request from 'supertest';

import { UserModule } from '../../src/user/user.module';
import { User } from '../../src/entities/user.entity';

describe('UserController (e2e)', () => {
  let module: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UserModule],
    }).compile();

    module = moduleFixture.createNestApplication();

    module.init();
  });

  it('/user (POST)', async () => {
    const result = await request(module.getHttpServer())
      .get('/user');

    expect(result.statusCode).toBe(HttpStatus.CREATED);
  });
});