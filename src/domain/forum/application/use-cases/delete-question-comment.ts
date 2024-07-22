import { Either, left, right } from '@/core/either';
import { QuestionCommentsRepository } from '../repositories/question-comments-repository';
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error';
import { NotAllowedError } from '@/core/errors/errors/not-allowed-error';

interface DeleteQuestionCommentUseCaseRequest {
    questionCommentId: string;
    authorId: string;
}

type DeleteQuestionCommentUseCaseResponse = Either<
    ResourceNotFoundError | NotAllowedError,
    {}
>;

export class DeleteQuestionCommentUseCase {
    constructor(
        private questionCommentRepository: QuestionCommentsRepository
    ) {}

    async handle({
        questionCommentId,
        authorId,
    }: DeleteQuestionCommentUseCaseRequest): Promise<DeleteQuestionCommentUseCaseResponse> {
        const questionComment = await this.questionCommentRepository.findById(
            questionCommentId
        );

        if (!questionComment) {
            return left(new ResourceNotFoundError());
        }

        if (authorId !== questionComment.authorId.toString()) {
            return left(new NotAllowedError());
        }

        await this.questionCommentRepository.delete(questionComment);

        return right({});
    }
}
