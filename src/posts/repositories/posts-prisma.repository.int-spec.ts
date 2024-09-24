import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'node:child_process'
import { NotFoundError } from '@/shared/errors/not-found.error'
import { PostsPrismaRepository } from './posts-prisma.repository'
import { PostsDataBuilder } from '../helpers/posts-data-builder'
import { AuthorDataBuilder } from '@/authors/helpers/author-data-builder'

describe('PostsPrismaRepository Integration Tests', () => {
	let module: TestingModule
	let repository: PostsPrismaRepository
	const prisma = new PrismaClient()

	beforeAll(async () => {
		execSync('npm run prisma:migratetest')
		await prisma.$connect()
		module = await Test.createTestingModule({}).compile()
		repository = new PostsPrismaRepository(prisma as any)
	}, 20000)

	beforeEach(async () => {
		await Promise.all([prisma.post.deleteMany(), prisma.author.deleteMany()])
	})

	afterAll(async () => {
		await module.close()
	})

	it('should throws an error when the id is not found', async () => {
		const id = crypto.randomUUID()
		await expect(repository.findById(id)).rejects.toThrow(
			new NotFoundError(`Post not found using ID ${id}`),
		)
	})

	it('should find a post by id', async () => {
		const postData = PostsDataBuilder()
		const authorData = AuthorDataBuilder()

		const author = await prisma.author.create({ data: authorData })
		const post = await prisma.post.create({
			data: {
				...postData,
				author: {
					connect: { ...author },
				},
			},
		})

		const result = await repository.findById(post.id)
		expect(result).toStrictEqual(post)
	})

	it('should create a post', async () => {
		const postData = PostsDataBuilder()
		const authorData = AuthorDataBuilder()

		const author = await prisma.author.create({ data: authorData })
		const result = await repository.create({ ...postData, authorId: author.id })

		expect(result).toMatchObject(postData)
	})

	it('should throws an error when updating a post not found', async () => {
		const id = crypto.randomUUID()
		const data = PostsDataBuilder()
		const post = {
			...data,
			id,
			authorId: id,
		}
		await expect(repository.update(post)).rejects.toThrow(
			new NotFoundError(`Post not found using ID ${id}`),
		)
	})

	it('should update a post', async () => {
		const postData = PostsDataBuilder()
		const authorData = AuthorDataBuilder()

		const author = await prisma.author.create({ data: authorData })
		const post = await repository.create({ ...postData, authorId: author.id })
		const result = await repository.update({
			...post,
			published: true,
			title: 'title-updated',
		})

		expect(result.published).toEqual(true)
		expect(result.title).toEqual('title-updated')
	})

	it('should return whern it dpes mpt find an post with the slug provided', async () => {
		const result = await repository.findBySlug('fake-slug-data')
		expect(result).toBeNull()
	})

	it('should find a post by slug', async () => {
		const postData = PostsDataBuilder()
		const authorData = AuthorDataBuilder()

		const author = await prisma.author.create({ data: authorData })
		const post = await prisma.post.create({
			data: {
				...postData,
				author: {
					connect: { ...author },
				},
			},
		})

		const result = await repository.findBySlug(post.slug)
		expect(result).toStrictEqual(post)
	})
})
