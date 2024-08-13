import { FetchAnswerCommentsUseCase } from './fetch-answer-comments'
import { InMemoryAnswerCommentsRepository } from 'test/repositories/in-memory-answer-comments-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeAnswerComment } from 'test/factories/make-answer-comment'
import { makeStudent } from 'test/factories/make-student'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-students-repository'

let inMemoryStudentsRepository: InMemoryStudentsRepository
let inMemoryAnswerCommentsRepository: InMemoryAnswerCommentsRepository
let sut: FetchAnswerCommentsUseCase

describe('Fetch Answer Comments', () => {
  beforeEach(() => {
    inMemoryStudentsRepository = new InMemoryStudentsRepository()
    inMemoryAnswerCommentsRepository = new InMemoryAnswerCommentsRepository(
      inMemoryStudentsRepository
    )
    sut = new FetchAnswerCommentsUseCase(inMemoryAnswerCommentsRepository)
  })

  it('should be able to fetch answer comments', async () => {
    const student = makeStudent({
      name: 'John Doe',
    })

    await inMemoryStudentsRepository.create(student)

    const comment1 = makeAnswerComment({
      authorId: student.id,
      answerId: new UniqueEntityID('answer-01'),
    })
    const comment2 = makeAnswerComment({
      authorId: student.id,
      answerId: new UniqueEntityID('answer-01'),
    })
    const comment3 = makeAnswerComment({
      authorId: student.id,
      answerId: new UniqueEntityID('answer-01'),
    })

    await inMemoryAnswerCommentsRepository.create(comment1)

    await inMemoryAnswerCommentsRepository.create(comment2)

    await inMemoryAnswerCommentsRepository.create(comment3)

    const result = await sut.handle({
      answerId: 'answer-01',
      page: 1,
    })

    expect(result.value?.comments).toHaveLength(3)
    expect(result.value?.comments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          author: 'John Doe',
          commentId: comment1.id,
        }),
        expect.objectContaining({
          author: 'John Doe',
          commentId: comment2.id,
        }),
        expect.objectContaining({
          author: 'John Doe',
          commentId: comment3.id,
        }),
      ])
    )
  })

  it('should be able to fetch paginated recent answers', async () => {
    const student = makeStudent({
      name: 'John Doe',
    })

    await inMemoryStudentsRepository.create(student)

    for (let i = 1; i <= 22; i++) {
      await inMemoryAnswerCommentsRepository.create(
        makeAnswerComment({
          answerId: new UniqueEntityID('answer-01'),
          authorId: new UniqueEntityID(student.id.toString()),
        })
      )
    }

    const result = await sut.handle({
      answerId: 'answer-01',
      page: 2,
    })

    expect(result.value?.comments).toHaveLength(2)
  })
})
