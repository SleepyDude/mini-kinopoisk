const dotenv = require("dotenv")

dotenv.config({path: process.env.NODE_ENV_LOCAL});
dotenv.config({path: process.env.NODE_ENV});

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ApiModule } from '../src/api.module';

import { usersPool } from './userDb';
import { PoolClient } from 'pg';
import { validateRefresh } from './validators/token.validator';

import * as cookieParser from 'cookie-parser';


describe('Access e2e', () => {
    let app: INestApplication;
    let poolClient: PoolClient;

    let ownerAccess: string; // OWNER
    let pawnAccess: string; // USER -> SMALLADMIN -> ..

    let bobAccess: string; // USER
    let bobRefresh: string;

    let aliceAccess: string; // ADMIN
    let aliceRefresh: string;

    let evaAccess: string; // SMALLADMIN
    let evaRefresh: string;

    let carolAccess: string; // BIGADMIN
    let carolRefresh: string;

    beforeAll(async () => {

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                ApiModule,
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.use(cookieParser());

        await app.init();

        poolClient = await usersPool.connect();

        // Инициализируем сервер
        await request(app.getHttpServer())
            .get('/init')
            .expect(200);

        const users = (await poolClient.query('SELECT * from users')).rows;

        // получаем токены админа
        await request(app.getHttpServer())
            .post('/auth/login')
            .send({email: process.env.OWNER_MAIL, password: process.env.OWNER_PASSWORD })
            .expect( (resp: any) => {
                ownerAccess = JSON.parse(resp.text).token;
            });
    });

    describe('User registration', () => {

        it('Пытаемся регистрировать пользователя с неверным email - ошибка', async () => {
            return await request(app.getHttpServer())
                .post('/auth/registration')
                .send({email: 'usermail.ru', password: '123321' })
                .expect(400);
        });

        it('Пытаемся регистрировать пользователя с коротким паролем - ошибка', async () => {
            return await request(app.getHttpServer())
                .post('/auth/registration')
                .send({email: 'admin@mail.ru', password: '123' })
                .expect(400);
        });

        it('Регистрируем пользователя - Bob, останется USER', async () => {
            return await request(app.getHttpServer())
                .post('/auth/registration')
                .send({email: 'bob@mail.ru', password: '123456' })
                .expect(201)
                .expect( (resp: any) => {
                    expect(resp).toHaveProperty('header');
                    const header = resp.header;
                    expect(header).toHaveProperty('set-cookie');
                    const setCookie = header['set-cookie'];
                    expect(setCookie).toHaveLength(1);
                    const refreshCookie = setCookie[0];
                    expect(validateRefresh(refreshCookie)).toBeTruthy();
                    expect(resp).toHaveProperty('text');
                    const body = JSON.parse(resp.text);
                    expect(body.email).toBe('bob@mail.ru');
                    expect(body).toHaveProperty('token');
                    expect(body.token.length).toBeGreaterThan(1);
                    bobAccess = body.token;
                    bobRefresh = header['set-cookie'];
                })
        });

        it('Регистрируем пользователя - Alice, потом будет ADMIN', async () => {
            return await request(app.getHttpServer())
                .post('/auth/registration')
                .send({email: 'alice@mail.ru', password: '123456' })
                .expect(201)
                .expect( (resp: any) => {
                    aliceAccess = JSON.parse(resp.text).token;
                    aliceRefresh = resp.header['set-cookie'];
                })
        });

        it('Регистрируем пользователя - Eva, потом будет SMALLADMIN', async () => {
            return await request(app.getHttpServer())
                .post('/auth/registration')
                .send({email: 'eva@mail.ru', password: '123456' })
                .expect(201)
                .expect( (resp: any) => {
                    evaAccess = JSON.parse(resp.text).token;
                    evaRefresh = resp.header['set-cookie'];
                })
        });

        it('Регистрируем пользователя - Carol, потом будет SMALLADMIN', async () => {
            return await request(app.getHttpServer())
                .post('/auth/registration')
                .send({email: 'carol@mail.ru', password: '123456' })
                .expect(201)
                .expect( (resp: any) => {
                    carolAccess = JSON.parse(resp.text).token;
                    // console.log(resp.header['set-cookie'][0]);
                    carolRefresh = resp.header['set-cookie'];
                })
        });

        it('Регистрируем пользователя - Pawn - пешку', async () => {
            return await request(app.getHttpServer())
                .post('/auth/registration')
                .send({email: 'pawn@mail.ru', password: '123456' })
                .expect(201)
                .expect( (resp: any) => {
                    pawnAccess = JSON.parse(resp.text).token;
                })
        });

        it('Error | Регистрируем пользователя c сущестующим email', async () => {
            return await request(app.getHttpServer())
                .post('/auth/registration')
                .send({email: 'bob@mail.ru', password: '123456' })
                .expect(409)
                .expect( (resp: any) => {
                    expect(resp).toHaveProperty('text');
                    const body = JSON.parse(resp.text);
                    expect(body).toHaveProperty('error');
                    expect(body.error).toBe("Пользователь с таким e-mail уже существует");
                })
        });

        it('Проверяем базу', async () => {
            const users = (await poolClient.query('SELECT * from users')).rows;
            const usersRoles = (await poolClient.query('SELECT * from user_roles')).rows;
            expect(users).toHaveLength(6);
            expect(usersRoles).toHaveLength(7);
        });
    });

    describe('Role creation', () => {

        it('Error | Попытка создать роль без заголовка авторизации', async () => {
            return await request(app.getHttpServer())
                .post('/roles')
                .send({name: 'Q', value: 3, description: 'R' })
                .expect(401)
                .expect( (resp: any) => {
                    expect(resp).toHaveProperty('text');
                    const body = JSON.parse(resp.text);
                    expect(body).toHaveProperty('error');
                    expect(body.error).toBe('Нет заголовка авторизации');
                });
        });

        it('Error | Неверный заголовок авторизации', async () => {
            await request(app.getHttpServer())
                .post('/roles')
                .send({name: 'Q', value: 3, description: 'R' })
                .set({'Authorization': 'tokenqwerty'})
                .expect(401)
                .expect( (resp: any) => {
                    expect(resp).toHaveProperty('text');
                    const body = JSON.parse(resp.text);
                    expect(body).toHaveProperty('error');
                    expect(body.error).toBe('Неверный формат заголовка авторизации');
                });

            return await request(app.getHttpServer())
                .post('/roles')
                .send({name: 'Q', value: 3, description: 'R' })
                .set({'Authorization': 'token qwerty'})
                .expect(401)
                .expect( (resp: any) => {
                    expect(resp).toHaveProperty('text');
                    const body = JSON.parse(resp.text);
                    expect(body).toHaveProperty('error');
                    expect(body.error).toBe('Неверный формат заголовка авторизации');
                });
        });

        it('Error | Невалидный токен', async () => {
            return await request(app.getHttpServer())
                .post('/roles')
                .send({name: 'Q', value: 3, description: 'R' })
                .set({'Authorization': 'bearer qwerty'})
                .expect(401)
                .expect( (resp: any) => {
                    // console.log(`Невалидный токен resp: ${JSON.stringify(resp)}`);
                    expect(resp).toHaveProperty('text');
                    const body = JSON.parse(resp.text);
                    expect(body).toHaveProperty('error');
                    expect(body.error).toBe('Невалидный токен');
                });
        });

        it('Error | USER (bob) не может создать роль', async () => {
            return await request(app.getHttpServer())
                .post('/roles')
                .send({name: 'Q', value: 3, description: 'R' })
                .auth(bobAccess, { type: "bearer" })
                .expect(403)
                .expect( (resp: any) => {
                    expect(resp).toHaveProperty('text');
                    const body = JSON.parse(resp.text);
                    expect(body).toHaveProperty('error');
                    expect(body.error).toBe('Недостаточно прав');
                });
        });

        it('Error | OWNER (admin) не может создать существующую роль', async () => {
            return await request(app.getHttpServer())
                .post('/roles')
                .send({name: 'USER', value: 3, description: 'R' })
                .auth(ownerAccess, { type: "bearer" })
                .expect(409)
                .expect( (resp: any) => {
                    // console.log(`resp: ${JSON.stringify(resp)}`);
                    expect(resp).toHaveProperty('text');
                    const body = JSON.parse(resp.text);
                    expect(body).toHaveProperty('error');
                    expect(body.error).toBe('Ошибка при создании роли (роль уже существует)');
                });
        });

        it('Success | OWNER (admin) создает роль SMALLADMIN(3)', async () => {
            const role = await request(app.getHttpServer())
                .post('/roles')
                .send({name: 'SMALLADMIN', value: 3, description: 'R' })
                .auth(ownerAccess, { type: "bearer" })
                .expect(201);
            return role;
        });

        it('Success | OWNER(999) - admin создает роль BIGADMIN(15)', async () => {
            const role = await request(app.getHttpServer())
                .post('/roles')
                .send({name: 'BIGADMIN', value: 15, description: 'R' })
                .auth(ownerAccess, { type: "bearer" })
                .expect(201);
            // Проверим, что в базе теперь 5 ролей (3 базовых + 2 новых)
            const roles = (await poolClient.query('SELECT * from roles')).rows;
            expect(roles).toHaveLength(5);
            
            return role;
        }); 

    });

    describe('Выдача ролей пользователям', () => {

        it('Error | USER (Bob) не может добавить роль SMALLADMIN Еве (т.к user value < admin value)', async () => {
            return await request(app.getHttpServer())
                .post('/users/add_role')
                .send({email: 'eva@mail.ru', roleName: 'SMALLADMIN'})
                .auth(bobAccess, { type: "bearer" })
                .expect(403)
                .expect( (resp: any) => {
                    expect(resp).toHaveProperty('text');
                    const body = JSON.parse(resp.text);
                    expect(body).toHaveProperty('error');
                    expect(body.error).toBe('Недостаточно прав');
                });
        });

        it('Success | OWNER(999) может добавить роль SMALLADMIN Еве', async () => {
            return await request(app.getHttpServer())
                .post('/users/add_role')
                .send({email: 'eva@mail.ru', roleName: 'SMALLADMIN'})
                .auth(ownerAccess, { type: "bearer" })
                .expect(201)
                .expect( (resp: any) => {
                    // console.log(`resp: ${JSON.stringify(resp)}`);
                    expect(resp).toHaveProperty('text');
                    const body = JSON.parse(resp.text);
                    expect(body).toHaveProperty('id', 5);
                    expect(body).toHaveProperty('value', 3);
                    expect(body).toHaveProperty('name', "SMALLADMIN");
                    expect(body).toHaveProperty('description', "R");
                });
        });

        it('Success | OWNER(999) добавляет другие роли (Alice - ADMIN, Carol - BIGADMIN)', async () => {
            await request(app.getHttpServer())
                .post('/users/add_role')
                .send({email: 'alice@mail.ru', roleName: 'ADMIN'})
                .auth(ownerAccess, { type: "bearer" })
                .expect(201);

            await request(app.getHttpServer())
                .post('/users/add_role')
                .send({email: 'carol@mail.ru', roleName: 'BIGADMIN'})
                .auth(ownerAccess, { type: "bearer" })
                .expect(201);
        });
    });

    describe('/auth/refresh (За одно обновляем роли)', () => {
        it('Alice, Eva, Carol', async () => {
            await request(app.getHttpServer())
                .post('/auth/refresh')
                .set('Cookie', aliceRefresh)
                .expect(201)
                .expect( (resp: any) => {
                    expect(resp).toHaveProperty('header');
                    const header = resp.header;
                    expect(header).toHaveProperty('set-cookie');
                    const setCookie = header['set-cookie'];
                    expect(setCookie).toHaveLength(1);
                    const refreshCookie = setCookie[0];
                    expect(validateRefresh(refreshCookie)).toBeTruthy();
                    expect(resp).toHaveProperty('text');
                    const body = JSON.parse(resp.text);
                    expect(body).toHaveProperty('token');
                    expect(body.token.length).toBeGreaterThan(1);
                    aliceAccess = body.token;
                    aliceRefresh = header['set-cookie'];
                });

            await request(app.getHttpServer())
                .post('/auth/refresh')
                .set('Cookie', evaRefresh)
                .expect(201)
                .expect( (resp: any) => {
                    const body = JSON.parse(resp.text);
                    evaAccess = body.token;
                    evaRefresh = resp.header['set-cookie'];
                });

            await request(app.getHttpServer())
                .post('/auth/refresh')
                .set('Cookie', carolRefresh)
                .expect(201)
                .expect( (resp: any) => {
                    const body = JSON.parse(resp.text);
                    carolAccess = body.token;
                    carolRefresh = resp.header['set-cookie'];
                });
        });
    });

    describe('Проверка прав на создание ролей', () => {
        
        it('Error | Eva SMALLADMIN(3) не может создать новую роль с value (1)', async () => {
            return await request(app.getHttpServer())
                .post('/roles')
                .send({name: 'Q', value: 1, description: 'R' })
                .auth(evaAccess, { type: "bearer" })
                .expect(403)
                .expect( (resp: any) => {
                    expect(resp).toHaveProperty('text');
                    const body = JSON.parse(resp.text);
                    expect(body).toHaveProperty('error');
                    expect(body.error).toBe('Недостаточно прав');
                });
        });

        it('Error | Alice ADMIN(10) не может создать новую роль с value (10) и с value (11)', async () => {
            await request(app.getHttpServer())
                .post('/roles')
                .send({name: 'Q', value: 10, description: 'R' })
                .auth(aliceAccess, { type: "bearer" })
                .expect(403)
                .expect( (resp: any) => {
                    expect(resp).toHaveProperty('text');
                    const body = JSON.parse(resp.text);
                    expect(body).toHaveProperty('error');
                    expect(body.error).toBe('Можно создать роль только с меньшими чем у Вас правами');
                });

            await request(app.getHttpServer())
                .post('/roles')
                .send({name: 'Q', value: 11, description: 'R' })
                .auth(aliceAccess, { type: "bearer" })
                .expect(403)
                .expect( (resp: any) => {
                    expect(resp).toHaveProperty('text');
                    const body = JSON.parse(resp.text);
                    expect(body).toHaveProperty('error');
                    expect(body.error).toBe('Можно создать роль только с меньшими чем у Вас правами');
                });
        });

        it('Success | Alice ADMIN(10) может создать новую роль с value = 9 и с value = 2', async () => {
            await request(app.getHttpServer())
                .post('/roles')
                .send({name: 'AliceCreated', value: 9, description: 'R' })
                .auth(aliceAccess, { type: "bearer" })
                .expect(201);

            await request(app.getHttpServer())
                .post('/roles')
                .send({name: 'TINYADMIN', value: 2, description: 'R' })
                .auth(aliceAccess, { type: "bearer" })
                .expect(201);
        });

    });

    describe('Проверка прав на присвоение роли', () => {

        it('Error | Eva SMALLADMIN(3) не может присвоить роль с value (2) пешке Pawn', async () => {
            return await request(app.getHttpServer())
                .post('/users/add_role')
                .send({email: 'pawn@mail.ru', roleName: 'TINYADMIN'})
                .auth(evaAccess, { type: "bearer" })
                .expect(403);
        });

        it('Success | Alice ADMIN(10) может присвоить роль с value (2) пешке Pawn', async () => {
            return await request(app.getHttpServer())
                .post('/users/add_role')
                .send({email: 'pawn@mail.ru', roleName: 'TINYADMIN'})
                .auth(aliceAccess, { type: "bearer" })
                .expect(201);
        });

        it('Error | Alice ADMIN(10) не может присвоить роль с value (10) пешке Pawn', async () => {
            return await request(app.getHttpServer())
                .post('/users/add_role')
                .send({email: 'pawn@mail.ru', roleName: 'ADMIN'})
                .auth(aliceAccess, { type: "bearer" })
                .expect( (resp: any) => {
                    console.log(`add_user resp: ${JSON.stringify(resp, undefined, 2)}`);
                })
                .expect(403);
        });

    });

    afterAll(async () => {

        // Чистим таблицы        
        await poolClient.query('TRUNCATE users RESTART IDENTITY CASCADE');
        await poolClient.query('TRUNCATE roles RESTART IDENTITY CASCADE');
        await poolClient.query('TRUNCATE tokens RESTART IDENTITY CASCADE');

        // console.log(queryResult.rows);
        
        poolClient.release(true);
        await usersPool.end();

        await app.close();
    }, 6000)
});