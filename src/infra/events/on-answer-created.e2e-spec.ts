import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { StudentFactory } from 'test/factories/make-student'
import { QuestionFactory } from 'test/factories/make-question'
import { Test } from '@nestjs/testing'
import { waitFor } from 'test/utils/wait-for'
import request from 'supertest'
import { DomainEvents } from '@/core/events/domain-events'

describe('On Answer Created (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [StudentFactory, QuestionFactory],
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    jwt = moduleRef.get(JwtService)

    DomainEvents.shouldRun = true

    await app.init()
  })

  it('should send a notification when anseer is created', async () => {
    const user = await studentFactory.makePrismaStudent()

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const createdQuestion = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    await request(app.getHttpServer())
      .post(`/questions/${createdQuestion.id}/answers`)
      .auth(accessToken, { type: 'bearer' })
      .send({
        content: 'The answer content',
        attachments: [],
      })

    await waitFor(async () => {
      const notificationOnDatabase = await prisma.notification.findFirst({
        where: {
          recipientId: user.id.toString(),
        },
      })

      expect(notificationOnDatabase).toBeTruthy()
    })
  })
})
