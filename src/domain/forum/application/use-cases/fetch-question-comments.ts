import { QuestionCommentsRepository } from '../repositories/question-comments-repository';
import { QuestionComment } from '../../enterprise/entities/question-comment';
import { Either, right } from '@/core/either';

interface FetchQuestionCommentsUseCaseRequest {
    questionId: string;
    page: number;
}

type FetchQuestionCommentsUseCaseResponse = Either<
    null,
    {
        questionComments: QuestionComment[];
    }
>;

export class FetchQuestionCommentsUseCase {
    constructor(
        private questionCommentsRepository: QuestionCommentsRepository
    ) {}

    async handle({
        questionId,
        page,
    }: FetchQuestionCommentsUseCaseRequest): Promise<FetchQuestionCommentsUseCaseResponse> {
        const questionComments =
            await this.questionCommentsRepository.findManyByQuestionId(
                questionId,
                {
                    page,
                }
            );

        return right({ questionComments });
    }
}
