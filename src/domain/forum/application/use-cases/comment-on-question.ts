import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { QuestionsRepository } from '../repositories/questions-repository';
import { QuestionComment } from '../../enterprise/entities/question-comment';
import { QuestionCommentsRepository } from '../repositories/question-comments-repository';
import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';

interface CommentOnQuestionUseCaseRequest {
    questionId: string;
    authorId: string;
    content: string;
}

type CommentOnQuestionUseCaseResponse = Either<
    ResourceNotFoundError,
    {
        questionComment: QuestionComment;
    }
>;

export class CommentOnQuestionUseCase {
    constructor(
        private questionCommentsRepository: QuestionCommentsRepository,
        private questionRepository: QuestionsRepository
    ) {}

    async handle({
        questionId,
        authorId,
        content,
    }: CommentOnQuestionUseCaseRequest): Promise<CommentOnQuestionUseCaseResponse> {
        const question = await this.questionRepository.findById(questionId);

        if (!question) {
            return left(new ResourceNotFoundError());
        }

        const questionComment = QuestionComment.create({
            questionId: new UniqueEntityID(questionId),
            authorId: new UniqueEntityID(authorId),
            content,
        });

        await this.questionCommentsRepository.create(questionComment);

        return right({ questionComment });
    }
}
