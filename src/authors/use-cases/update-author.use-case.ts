import { BadRequestError } from '@/shared/errors/bad-request.error'
import { AuthorOutput } from '../dto/author.output'
import { Author } from '../graphql/models/author'
import { AuthorsPrismaRepository } from '../repositories/authors-prisma.repository'
import { ConflictError } from '@/shared/errors/conflict.error'

export namespace UpdateAuthorUseCase {
	export type Input = Partial<Author>

	export type Output = AuthorOutput

	export class UseCase {
		constructor(private authorsRepository: AuthorsPrismaRepository) {}

		public async execute(input: Input): Promise<Output> {
			const author = await this.authorsRepository.findById(input.id)

			if (input.email) {
				const emailExists = await this.authorsRepository.findByEmail(
					input.email,
				)
				if (emailExists && emailExists.id && author.id) {
					throw new ConflictError('Email address used by other author')
				}

				author.email = input.email
			}

			if (input.name) {
				author.name = input.name
			}

			return this.authorsRepository.update(author)
		}
	}
}
