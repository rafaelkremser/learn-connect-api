import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { AnswersRepository } from '../repositories/answers-repository';
import { AnswerComment } from '../../enterprise/entities/answer-comment';
import { AnswerCommentsRepository } from '../repositories/answer-comments-repository';
import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';

interface CommentOnAnswerUseCaseRequest {
    answerId: string;
    authorId: string;
    content: string;
}

type CommentOnAnswerUseCaseResponse = Either<
    ResourceNotFoundError,
    {
        answerComment: AnswerComment;
    }
>;

export class CommentOnAnswerUseCase {
    constructor(
        private answerCommentsRepository: AnswerCommentsRepository,
        private answerRepository: AnswersRepository
    ) {}

    async handle({
        answerId,
        authorId,
        content,
    }: CommentOnAnswerUseCaseRequest): Promise<CommentOnAnswerUseCaseResponse> {
        const answer = await this.answerRepository.findById(answerId);

        if (!answer) {
            return left(new ResourceNotFoundError());
        }

        const answerComment = AnswerComment.create({
            answerId: new UniqueEntityID(answerId),
            authorId: new UniqueEntityID(authorId),
            content,
        });

        await this.answerCommentsRepository.create(answerComment);

        return right({ answerComment });
    }
}
