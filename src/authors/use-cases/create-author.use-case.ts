import { AuthorsPrismaRepository } from '../repositories/authors-prisma.repository'
import { BadRequestError } from '@/shared/errors/bad-request.error'
import { ConflictError } from '@/shared/errors/conflict.error'
import { AuthorOutput } from '../dto/author.output'

export namespace CreateAuthorUseCase {
	export type Input = {
		name: string
		email: string
	}

	export type Output = AuthorOutput

	export class UseCase {
		constructor(private authorsRepository: AuthorsPrismaRepository) {}

		public async execute(input: Input): Promise<Output> {
			const { name, email } = input
			if (!name || !email) {
				throw new BadRequestError('Input data not provided')
			}

			const emailExists = await this.authorsRepository.findByEmail(email)
			if (emailExists) {
				throw new ConflictError('Email address used by other author')
			}

			const author = await this.authorsRepository.create(input)
			return author
		}
	}
}
