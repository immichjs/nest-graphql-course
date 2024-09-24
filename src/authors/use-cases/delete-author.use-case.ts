import { AuthorOutput } from '../dto/author.output'
import { AuthorsPrismaRepository } from '../repositories/authors-prisma.repository'

export namespace DeleteAuthorUseCase {
	export type Input = {
		id: string
	}

	export type Output = AuthorOutput

	export class UseCase {
		constructor(private authorsRepository: AuthorsPrismaRepository) {}

		public async execute(input: Input): Promise<Output> {
			const { id } = input
			const author = await this.authorsRepository.delete(id)
			return author
		}
	}
}
