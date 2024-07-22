import { CommentOnAnswerUseCase } from './comment-on-answer';
import { InMemoryAnswerCommentsRepository } from 'test/repositories/in-memory-answer-comments-repository';
import { DeleteAnswerCommentUseCase } from './delete-answer-comment';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository';
import { makeAnswerComment } from 'test/factories/make-answer-comment';
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error';

let inMemoryAnswerCommentsRepository: InMemoryAnswerCommentsRepository;
let inMemoryAnswersRepository: InMemoryAnswersRepository;
let commentOnAnswerUseCase: CommentOnAnswerUseCase;
let sut: DeleteAnswerCommentUseCase;

describe('Delete Answer Comment', () => {
    beforeEach(() => {
        inMemoryAnswerCommentsRepository =
            new InMemoryAnswerCommentsRepository();
        commentOnAnswerUseCase = new CommentOnAnswerUseCase(
            inMemoryAnswerCommentsRepository,
            inMemoryAnswersRepository
        );
        sut = new DeleteAnswerCommentUseCase(inMemoryAnswerCommentsRepository);
    });

    it('should be able to delete a answer comment', async () => {
        const answerComment = makeAnswerComment();
        await inMemoryAnswerCommentsRepository.create(answerComment);

        await sut.handle({
            answerCommentId: answerComment.id.toString(),
            authorId: answerComment.authorId.toString(),
        });

        expect(inMemoryAnswerCommentsRepository.items[0]).toBeFalsy();
    });

    it('should not be able to delete another user answer comment', async () => {
        const answerComment = makeAnswerComment({
            authorId: new UniqueEntityID('author-01'),
        });
        await inMemoryAnswerCommentsRepository.create(answerComment);

        const result = await sut.handle({
            answerCommentId: answerComment.id.toString(),
            authorId: 'author-02',
        });

        expect(result.isLeft()).toBe(true);
        expect(result.value).toBeInstanceOf(NotAllowedError);
    });
});
