import {
	Args,
	Mutation,
	Parent,
	Query,
	ResolveField,
	Resolver,
} from '@nestjs/graphql'
import { Post } from '../models/post'
import { Inject } from '@nestjs/common'
import { CreatePostUseCase } from '@/posts/use-cases/create-post.use-case'
import { CreatePostInput } from '../inputs/create-post.input'
import { GetAuthorUseCase } from '@/authors/use-cases/get-author.use-case'
import { GetPostUseCase } from '@/posts/use-cases/get-post.use-case'
import { PostIdArgs } from '../args/post-id.args'
import { PublishPostUseCase } from '@/posts/use-cases/publish-post.use-case'
import { UnpublishPostUseCase } from '@/posts/use-cases/unpublish-post.use-case'

@Resolver(() => Post)
export class PostsResolver {
	@Inject(CreatePostUseCase.UseCase)
	private readonly createPostUseCase: CreatePostUseCase.UseCase
	@Inject(GetAuthorUseCase.UseCase)
	private readonly getAuthorUseCase: GetAuthorUseCase.UseCase
	@Inject(GetPostUseCase.UseCase)
	private readonly getPostUseCase: GetPostUseCase.UseCase
	@Inject(PublishPostUseCase.UseCase)
	private readonly publishPostUseCase: PublishPostUseCase.UseCase
	@Inject(UnpublishPostUseCase.UseCase)
	private readonly unpublishUseCase: UnpublishPostUseCase.UseCase

	@Mutation(() => Post)
	public async createPost(@Args('data') data: CreatePostInput) {
		return this.createPostUseCase.execute(data)
	}

	@ResolveField()
	public async author(@Parent() post: Post) {
		return this.getAuthorUseCase.execute({
			id: post.authorId,
		})
	}

	@Query(() => Post)
	public async getPostById(@Args() { id }: PostIdArgs) {
		return this.getPostUseCase.execute({ id })
	}

	@Mutation(() => Post)
	public async publishPost(@Args() { id }: PostIdArgs) {
		return this.publishPostUseCase.execute({ id })
	}

	@Mutation(() => Post)
	public async unpublishPost(@Args() { id }: PostIdArgs) {
		return this.unpublishUseCase.execute({ id })
	}
}
