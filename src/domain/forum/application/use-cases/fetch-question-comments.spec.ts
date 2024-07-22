import { FetchQuestionCommentsUseCase } from './fetch-question-comments';
import { InMemoryQuestionCommentsRepository } from 'test/repositories/in-memory-question-comments-repository';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { makeQuestionComment } from 'test/factories/make-question-comment';

let inMemoryQuestionCommentsRepository: InMemoryQuestionCommentsRepository;
let sut: FetchQuestionCommentsUseCase;

describe('Fetch Question Comments', () => {
    beforeEach(() => {
        inMemoryQuestionCommentsRepository =
            new InMemoryQuestionCommentsRepository();
        sut = new FetchQuestionCommentsUseCase(
            inMemoryQuestionCommentsRepository
        );
    });

    it('should be able to fetch question comments', async () => {
        await inMemoryQuestionCommentsRepository.create(
            makeQuestionComment({
                questionId: new UniqueEntityID('question-01'),
            })
        );
        await inMemoryQuestionCommentsRepository.create(
            makeQuestionComment({
                questionId: new UniqueEntityID('question-01'),
            })
        );
        await inMemoryQuestionCommentsRepository.create(
            makeQuestionComment({
                questionId: new UniqueEntityID('question-01'),
            })
        );

        const result = await sut.handle({
            questionId: 'question-01',
            page: 1,
        });

        expect(result.value?.questionComments).toHaveLength(3);
    });

    it('should be able to fetch paginated recent questions', async () => {
        for (let i = 1; i <= 22; i++) {
            await inMemoryQuestionCommentsRepository.create(
                makeQuestionComment({
                    questionId: new UniqueEntityID('question-01'),
                })
            );
        }

        const result = await sut.handle({
            questionId: 'question-01',
            page: 2,
        });

        expect(result.value?.questionComments).toHaveLength(2);
    });
});
