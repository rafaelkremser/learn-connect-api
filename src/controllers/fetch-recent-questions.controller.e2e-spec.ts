import { AppModule } from '@/app.module';
import { PrismaService } from '@/prisma/prisma.service';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';

describe('Fetch Recent Questions (E2E)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let jwt: JwtService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();

        prisma = moduleRef.get(PrismaService);
        jwt = moduleRef.get(JwtService);

        await app.init();
    });

    test('[GET] /questions', async () => {
        const user = await prisma.user.create({
            data: {
                name: 'Jonh Doe',
                email: 'johndoe@email.com',
                password: '123456',
            },
        });

        const accessToken = jwt.sign({ sub: user.id });

        await prisma.question.createMany({
            data: [
                {
                    title: 'New question 1',
                    content: 'A new question for test',
                    slug: 'new-question-1',
                    authorId: user.id,
                },
                {
                    title: 'New question 2',
                    content: 'A new question for test',
                    slug: 'new-question-2',
                    authorId: user.id,
                },
            ],
        });

        const response = await request(app.getHttpServer())
            .get('/questions')
            .auth(accessToken, { type: 'bearer' });

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            questions: [
                expect.objectContaining({ title: 'New question 1' }),
                expect.objectContaining({ title: 'New question 2' }),
            ],
        });
    });
});
