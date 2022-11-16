import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

import * as request from 'supertest';
import { Chance } from 'chance';
import { mock } from 'jest-mock-extended';
import { Repository } from 'typeorm';

import { AppModule } from './../src/app.module';
import { User } from './../src/entities';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let usersRepositoryMock: jest.Mocked<Repository<User>>;

  let chance: Chance.Chance;

  beforeEach(async () => {
    usersRepositoryMock = mock<Repository<User>>();

    chance = new Chance();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
        /*
      providers: [
        {
          provide: getRepositoryToken(User),
          useValue: usersRepositoryMock,
        },
      ],
      */
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('UserController (e2e)', () => {
    it('/user (POST)', async () => {
      const userMock = {
        name: chance.string({ length: 20 }),
        password: chance.string({ length: 10 }),
      };
      usersRepositoryMock.save.mockReturnValue(
        (async () => {
          const newUser = new User();
          newUser.name = userMock.name;
          newUser.password = userMock.password;

          return newUser
        })()
      );

      const result = await request(app.getHttpServer())
        .post('/user')
        .send(userMock);

      expect(result.statusCode).toBe(HttpStatus.CREATED);
      expect(result.body).toEqual(
        expect.objectContaining(userMock),
      );
    });
  });
});
