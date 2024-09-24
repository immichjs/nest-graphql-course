import { DatabaseModule } from './../database/database.module'
import { Module } from '@nestjs/common'
import { AuthorsResolver } from './graphql/resolvers/authors.resolver'
import { PrismaService } from '@/database/prisma/prisma.service'
import { AuthorsPrismaRepository } from './repositories/authors-prisma.repository'
import { ListAuthorsUseCase } from './use-cases/list-authors.use-case'
import { GetAuthorUseCase } from './use-cases/get-author.use-case'
import { UpdateAuthorUseCase } from './use-cases/update-author.use-case'
import { CreateAuthorUseCase } from './use-cases/create-author.use-case'
import { DeleteAuthorUseCase } from './use-cases/delete-author.use-case'

@Module({
	imports: [DatabaseModule],
	providers: [
		AuthorsResolver,
		{
			provide: 'PrismaService',
			useClass: PrismaService,
		},
		{
			provide: 'AuthorsRepository',
			useFactory: (prisma: PrismaService) => {
				return new AuthorsPrismaRepository(prisma)
			},
			inject: ['PrismaService'],
		},
		{
			provide: ListAuthorsUseCase.UseCase,
			useFactory: (authorsRepository: AuthorsPrismaRepository) => {
				return new ListAuthorsUseCase.UseCase(authorsRepository)
			},
			inject: ['AuthorsRepository'],
		},
		{
			provide: GetAuthorUseCase.UseCase,
			useFactory: (authorsRepository: AuthorsPrismaRepository) => {
				return new GetAuthorUseCase.UseCase(authorsRepository)
			},
			inject: ['AuthorsRepository'],
		},
		{
			provide: CreateAuthorUseCase.UseCase,
			useFactory: (authorsRepository: AuthorsPrismaRepository) => {
				return new CreateAuthorUseCase.UseCase(authorsRepository)
			},
			inject: ['AuthorsRepository'],
		},
		{
			provide: UpdateAuthorUseCase.UseCase,
			useFactory: (authorsRepository: AuthorsPrismaRepository) => {
				return new UpdateAuthorUseCase.UseCase(authorsRepository)
			},
			inject: ['AuthorsRepository'],
		},
		{
			provide: DeleteAuthorUseCase.UseCase,
			useFactory: (authorsRepository: AuthorsPrismaRepository) => {
				return new DeleteAuthorUseCase.UseCase(authorsRepository)
			},
			inject: ['AuthorsRepository'],
		},
	],
})
export class AuthorsModule {}
