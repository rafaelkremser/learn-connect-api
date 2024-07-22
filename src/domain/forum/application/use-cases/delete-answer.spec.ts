import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository';
import { makeAnswer } from 'test/factories/make-answer';
import { DeleteAnswerUseCase } from './delete-answer';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { AnswerQuestionUseCase } from './answer-question';
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error';
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachments-repository';
import { makeAnswerAttachment } from 'test/factories/make-answer-attachment';

let inMemoryAnswerAttachmentsRepository: InMemoryAnswerAttachmentsRepository;
let inMemoryAnswersRepository: InMemoryAnswersRepository;
let sut: DeleteAnswerUseCase;

describe('Delete Answer', () => {
    beforeEach(() => {
        inMemoryAnswerAttachmentsRepository =
            new InMemoryAnswerAttachmentsRepository();
        inMemoryAnswersRepository = new InMemoryAnswersRepository(
            inMemoryAnswerAttachmentsRepository
        );

        sut = new DeleteAnswerUseCase(inMemoryAnswersRepository);
    });

    it('should be able to delete a answer', async () => {
        const createdAnswer = makeAnswer(
            { authorId: new UniqueEntityID('author-01') },
            new UniqueEntityID('answer-01')
        );

        await inMemoryAnswersRepository.create(createdAnswer);

        inMemoryAnswerAttachmentsRepository.items.push(
            makeAnswerAttachment({
                answerId: createdAnswer.id,
                attachmentId: new UniqueEntityID('1'),
            }),
            makeAnswerAttachment({
                answerId: createdAnswer.id,
                attachmentId: new UniqueEntityID('2'),
            })
        );

        await sut.handle({
            answerId: 'answer-01',
            authorId: 'author-01',
        });

        expect(inMemoryAnswersRepository.items).toHaveLength(0);
        expect(inMemoryAnswerAttachmentsRepository.items).toHaveLength(0);
    });

    it('should not be able to delete a answer from another user', async () => {
        const createdAnswer = makeAnswer(
            { authorId: new UniqueEntityID('author-01') },
            new UniqueEntityID('answer-01')
        );
        await inMemoryAnswersRepository.create(createdAnswer);

        const result = await sut.handle({
            answerId: 'answer-01',
            authorId: 'author-02',
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(NotAllowedError);
    });
});
