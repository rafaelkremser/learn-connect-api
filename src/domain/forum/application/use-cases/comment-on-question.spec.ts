import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository';
import { CommentOnQuestionUseCase } from './comment-on-question';
import { InMemoryQuestionCommentsRepository } from 'test/repositories/in-memory-question-comments-repository';
import { makeQuestion } from 'test/factories/make-question';
import { InMemoryQuestionAttachmentsRepository } from 'test/repositories/in-memory-question-attachments-repository';

let inMemoryQuestionCommentsRepository: InMemoryQuestionCommentsRepository;
let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentsRepository;
let inMemoryQuestionsRepository: InMemoryQuestionsRepository;
let sut: CommentOnQuestionUseCase;

describe('Comment Question', () => {
    beforeEach(() => {
        inMemoryQuestionAttachmentsRepository =
            new InMemoryQuestionAttachmentsRepository();
        inMemoryQuestionsRepository = new InMemoryQuestionsRepository(
            inMemoryQuestionAttachmentsRepository
        );
        inMemoryQuestionCommentsRepository =
            new InMemoryQuestionCommentsRepository();
        sut = new CommentOnQuestionUseCase(
            inMemoryQuestionCommentsRepository,
            inMemoryQuestionsRepository
        );
    });

    it('should be able to comment a question', async () => {
        const question = makeQuestion();

        await inMemoryQuestionsRepository.create(question);

        const result = await sut.handle({
            questionId: question.id.toString(),
            authorId: 'author-01',
            content: 'An example for comment',
        });

        expect(result.isRight()).toBe(true);
        expect(inMemoryQuestionCommentsRepository.items[0].content).toEqual(
            'An example for comment'
        );
    });
});
