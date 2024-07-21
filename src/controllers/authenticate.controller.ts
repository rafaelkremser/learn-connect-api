import { ConflictException, UsePipes } from '@nestjs/common';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcryptjs';
import { ZodValidationPipe } from 'src/pipes/zod-validation-pipe';
import { PrismaService } from 'src/prisma/prisma.service';
import { z } from 'zod';

const authenticateBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
});

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>;

@Controller('/sessions')
export class AuthenticateController {
    constructor(private jwt: JwtService) {}

    @Post()
    // @HttpCode(201)
    // @UsePipes(new ZodValidationPipe(authenticateBodySchema))
    async handle(@Body() body: AuthenticateBodySchema) {
        const token = this.jwt.sign({ sub: 'user-id' });

        return token;
    }
}
