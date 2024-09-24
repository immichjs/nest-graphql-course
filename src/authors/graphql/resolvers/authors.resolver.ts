import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { Author } from '../models/author'
import { Inject } from '@nestjs/common'
import { ListAuthorsUseCase } from '@/authors/use-cases/list-authors.use-case'
import { SearchParametersArgs } from '../args/search-parameters.args'
import { SearchAuthorsResult } from '../models/search-authors.result'
import { CreateAuthorUseCase } from '@/authors/use-cases/create-author.use-case'
import { CreateAuthorInput } from '../inputs/create-author.input'
import { GetAuthorUseCase } from '@/authors/use-cases/get-author.use-case'
import { AuthorIdArgs } from '../args/author-id.args'
import { UpdateAuthorUseCase } from '@/authors/use-cases/update-author.use-case'
import { UpdateAuthorInput } from '../inputs/update-author.input'
import { DeleteAuthorUseCase } from '@/authors/use-cases/delete-author.use-case'

@Resolver(() => Author)
export class AuthorsResolver {
	@Inject(ListAuthorsUseCase.UseCase)
	private readonly listAuthorsUseCase: ListAuthorsUseCase.UseCase

	@Inject(CreateAuthorUseCase.UseCase)
	private readonly createAuthorUseCase: CreateAuthorUseCase.UseCase

	@Inject(GetAuthorUseCase.UseCase)
	private readonly getAuthorUseCase: GetAuthorUseCase.UseCase

	@Inject(UpdateAuthorUseCase.UseCase)
	private readonly updateAuthorUseCase: UpdateAuthorUseCase.UseCase

	@Inject(DeleteAuthorUseCase.UseCase)
	private readonly deleteAuthorUseCase: DeleteAuthorUseCase.UseCase

	@Query(() => SearchAuthorsResult)
	public async listAuthors(
		@Args() { page, perPage, sort, sortDir, filter }: SearchParametersArgs,
	) {
		return this.listAuthorsUseCase.execute({
			page,
			perPage,
			sort,
			sortDir,
			filter,
		})
	}

	@Query(() => Author)
	public async getAuthorById(@Args() { id }: AuthorIdArgs) {
		return this.getAuthorUseCase.execute({
			id,
		})
	}

	@Mutation(() => Author)
	public async createAuthor(@Args('data') data: CreateAuthorInput) {
		return this.createAuthorUseCase.execute(data)
	}

	@Mutation(() => Author)
	public async updateAuthor(
		@Args() { id }: AuthorIdArgs,
		@Args('data') data: UpdateAuthorInput,
	) {
		return this.updateAuthorUseCase.execute({
			id,
			...data,
		})
	}

	@Mutation(() => Author)
	public async deleteAuthor(@Args() { id }: AuthorIdArgs) {
		return this.deleteAuthorUseCase.execute({
			id,
		})
	}
}
