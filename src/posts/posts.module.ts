import { PrismaService } from '@/database/prisma/prisma.service'
import { Module } from '@nestjs/common'
import { PostsPrismaRepository } from './repositories/posts-prisma.repository'
import { DatabaseModule } from '@/database/database.module'
import { CreatePostUseCase } from './use-cases/create-post.use-case'
import { AuthorsPrismaRepository } from '@/authors/repositories/authors-prisma.repository'
import { GetPostUseCase } from './use-cases/get-post.use-case'
import { PublishPostUseCase } from './use-cases/publish-post.use-case'
import { UnpublishPostUseCase } from './use-cases/unpublish-post.use-case'
import { PostsResolver } from './graphql/resolvers/posts.resolver'
import { GetAuthorUseCase } from '@/authors/use-cases/get-author.use-case'

@Module({
	imports: [DatabaseModule],
	providers: [
		PostsResolver,
		{
			provide: 'PrismaService',
			useClass: PrismaService,
		},
		{
			provide: 'PostsRepository',
			useFactory: (prismaService: PrismaService) => {
				return new PostsPrismaRepository(prismaService)
			},
			inject: ['PrismaService'],
		},
		{
			provide: 'AuthorsRepository',
			useFactory: (prismaService: PrismaService) => {
				return new AuthorsPrismaRepository(prismaService)
			},
			inject: ['PrismaService'],
		},
		{
			provide: CreatePostUseCase.UseCase,
			useFactory: (
				postsRepository: PostsPrismaRepository,
				authorsRepository: AuthorsPrismaRepository,
			) => {
				return new CreatePostUseCase.UseCase(postsRepository, authorsRepository)
			},
			inject: ['PostsRepository', 'AuthorsRepository'],
		},
		{
			provide: GetPostUseCase.UseCase,
			useFactory: (postsRepository: PostsPrismaRepository) => {
				return new GetPostUseCase.UseCase(postsRepository)
			},
			inject: ['PostsRepository'],
		},
		{
			provide: PublishPostUseCase.UseCase,
			useFactory: (postsRepository: PostsPrismaRepository) => {
				return new PublishPostUseCase.UseCase(postsRepository)
			},
			inject: ['PostsRepository'],
		},
		{
			provide: UnpublishPostUseCase.UseCase,
			useFactory: (postsRepository: PostsPrismaRepository) => {
				return new UnpublishPostUseCase.UseCase(postsRepository)
			},
			inject: ['PostsRepository'],
		},
		{
			provide: GetAuthorUseCase.UseCase,
			useFactory: (authorsRepository: AuthorsPrismaRepository) => {
				return new GetAuthorUseCase.UseCase(authorsRepository)
			},
			inject: ['AuthorsRepository'],
		},
	],
})
export class PostsModule {}
