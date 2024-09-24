import { PostOutput } from '../dto/post.output'
import { PostsPrismaRepository } from '../repositories/posts-prisma.repository'

export namespace UnpublishPostUseCase {
	export type Input = {
		id: string
	}

	export type Output = PostOutput

	export class UseCase {
		constructor(private readonly postsRepository: PostsPrismaRepository) {}

		public async execute(input: Input): Promise<Output> {
			const post = await this.postsRepository.findById(input.id)
			post.published = false
			const postUpdated = await this.postsRepository.update(post)

			return postUpdated as PostOutput
		}
	}
}
