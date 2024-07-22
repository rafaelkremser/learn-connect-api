import { AnswerQuestionUseCase } from './answer-question';
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository';
import { makeAnswer } from 'test/factories/make-answer';
import { EditAnswerUseCase } from './edit-answer';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error';
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachments-repository';
import { makeAnswerAttachment } from 'test/factories/make-answer-attachment';

let inMemoryAnswersRepository: InMemoryAnswersRepository;
let inMemoryAnswerAttachmentsRepository: InMemoryAnswerAttachmentsRepository;
let sut: EditAnswerUseCase;

describe('Edit Answer', () => {
    beforeEach(() => {
        inMemoryAnswerAttachmentsRepository =
            new InMemoryAnswerAttachmentsRepository();
        inMemoryAnswersRepository = new InMemoryAnswersRepository(
            inMemoryAnswerAttachmentsRepository
        );

        sut = new EditAnswerUseCase(
            inMemoryAnswersRepository,
            inMemoryAnswerAttachmentsRepository
        );
    });

    it('should be able to edit a answer', async () => {
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
            content: 'New content',
            attachmentsIds: ['1', '3'],
        });

        expect(inMemoryAnswersRepository.items[0]).toMatchObject({
            content: 'New content',
        });
        expect(
            inMemoryAnswersRepository.items[0].attachments.currentItems
        ).toHaveLength(2);
        expect(
            inMemoryAnswersRepository.items[0].attachments.currentItems
        ).toEqual([
            expect.objectContaining({ attachmentId: new UniqueEntityID('1') }),
            expect.objectContaining({ attachmentId: new UniqueEntityID('3') }),
        ]);
    });

    it('should not be able to edit a answer from another user', async () => {
        const createdAnswer = makeAnswer(
            { authorId: new UniqueEntityID('author-01') },
            new UniqueEntityID('answer-01')
        );
        await inMemoryAnswersRepository.create(createdAnswer);

        const result = await sut.handle({
            answerId: 'answer-01',
            authorId: 'author-02',
            content: 'New content',
            attachmentsIds: [],
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(NotAllowedError);
    });
});
