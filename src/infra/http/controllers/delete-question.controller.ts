import {
  BadRequestException,
  Controller,
  HttpCode,
  Param,
  Delete,
} from '@nestjs/common'
import { DeleteQuestionUseCase } from '@/domain/forum/application/use-cases/delete-question'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'

@Controller('/questions/:id')
export class DeleteQuestionController {
  constructor(private deleteQuestion: DeleteQuestionUseCase) {}

  @Delete()
  @HttpCode(204)
  async handle(
    @Param('id') questionId: string,
    @CurrentUser() user: UserPayload
  ) {
    const userId = user.sub

    const result = await this.deleteQuestion.handle({
      questionId,
      authorId: userId,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }
  }
}
