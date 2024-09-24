import { PrismaService } from '@/database/prisma/prisma.service'
import { Post } from '../graphql/models/post'
import { PostsRepository } from '../interfaces/posts.repository'
import { NotFoundError } from '@/shared/errors/not-found.error'

export class PostsPrismaRepository implements PostsRepository {
	constructor(private readonly prismaService: PrismaService) {}

	public async create(
		data: Omit<Post, 'id' | 'createdAt' | 'author'>,
	): Promise<Post> {
		const post = await this.prismaService.post.create({ data })
		return post
	}

	public async update(postParameters: Post): Promise<Post> {
		await this.get(postParameters.id)
		const post = await this.prismaService.post.update({
			data: postParameters as any,
			where: {
				id: postParameters.id,
			},
		})

		return post
	}

	public async findById(id: string): Promise<Post> {
		return this.get(id)
	}

	public async findBySlug(slug: string): Promise<Post> {
		const post = await this.prismaService.post.findUnique({
			where: {
				slug,
			},
		})

		return post
	}

	public async get(id: string): Promise<Post> {
		const post = await this.prismaService.post.findUnique({
			where: {
				id,
			},
		})

		if (!post) {
			throw new NotFoundError(`Post not found using ID ${id}`)
		}

		return post
	}
}
