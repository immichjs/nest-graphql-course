import { SearchInput } from '@/shared/dto/search-input'
import { AuthorOutput } from '../dto/author.output'
import { AuthorsPrismaRepository } from '../repositories/authors-prisma.repository'
import { PaginationOutput } from '@/shared/dto/pagination-output'

export namespace ListAuthorsUseCase {
	export type Input = SearchInput
	export type Output = PaginationOutput<AuthorOutput>

	export class UseCase {
		constructor(private authorsRepository: AuthorsPrismaRepository) {}

		public async execute(input: Input): Promise<Output> {
			const searchResult = await this.authorsRepository.search(input)
			return { ...searchResult }
		}
	}
}
