import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository';
import { CommentOnAnswerUseCase } from './comment-on-answer';
import { InMemoryAnswerCommentsRepository } from 'test/repositories/in-memory-answer-comments-repository';
import { makeAnswer } from 'test/factories/make-answer';
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachments-repository';

let inMemoryAnswerAttachmentsRepository: InMemoryAnswerAttachmentsRepository;
let inMemoryAnswerCommentsRepository: InMemoryAnswerCommentsRepository;
let inMemoryAnswersRepository: InMemoryAnswersRepository;
let sut: CommentOnAnswerUseCase;

describe('Comment Answer', () => {
    beforeEach(() => {
        inMemoryAnswerAttachmentsRepository =
            new InMemoryAnswerAttachmentsRepository();
        inMemoryAnswersRepository = new InMemoryAnswersRepository(
            inMemoryAnswerAttachmentsRepository
        );
        inMemoryAnswerCommentsRepository =
            new InMemoryAnswerCommentsRepository();

        sut = new CommentOnAnswerUseCase(
            inMemoryAnswerCommentsRepository,
            inMemoryAnswersRepository
        );
    });

    it('should be able to comment a answer', async () => {
        const answer = makeAnswer();

        await inMemoryAnswersRepository.create(answer);

        const result = await sut.handle({
            answerId: answer.id.toString(),
            authorId: 'author-01',
            content: 'An example for comment',
        });

        expect(result.isRight()).toBe(true);
        expect(inMemoryAnswerCommentsRepository.items[0].content).toEqual(
            'An example for comment'
        );
    });
});
