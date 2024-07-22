import { Question } from '@/domain/forum/enterprise/entities/question';
import { QuestionsRepository } from '../repositories/questions-repository';
import { Either, right } from '@/core/either';

interface FetchRecentQuestionsUseCaseRequest {
    page: number;
}

type FetchRecentQuestionsUseCaseResponse = Either<
    null,
    {
        questions: Question[];
    }
>;

export class FetchRecentQuestionsUseCase {
    constructor(private questionRepository: QuestionsRepository) {}

    async handle({
        page,
    }: FetchRecentQuestionsUseCaseRequest): Promise<FetchRecentQuestionsUseCaseResponse> {
        const questions = await this.questionRepository.findManyRecent({
            page,
        });

        return right({ questions });
    }
}
