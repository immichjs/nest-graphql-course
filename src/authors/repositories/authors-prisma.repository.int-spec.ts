import { Test, TestingModule } from '@nestjs/testing'
import { AuthorsPrismaRepository } from './authors-prisma.repository'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'node:child_process'
import { NotFoundError } from '@/shared/errors/not-found.error'
import { AuthorDataBuilder } from '../helpers/author-data-builder'

describe('AuthorsPrismaRepository Integration Tests', () => {
	let module: TestingModule
	let repository: AuthorsPrismaRepository
	const prisma = new PrismaClient()

	beforeAll(async () => {
		execSync('npm run prisma:migratetest')
		await prisma.$connect()
		module = await Test.createTestingModule({}).compile()
		repository = new AuthorsPrismaRepository(prisma as any)
	}, 20000)

	beforeEach(async () => {
		await prisma.author.deleteMany()
	})

	afterAll(async () => {
		await module.close()
	})

	it('should throws an error when the id is not found', async () => {
		const id = crypto.randomUUID()
		await expect(repository.findById(id)).rejects.toThrow(
			new NotFoundError(`Author not found using ID ${id}`),
		)
	})

	it('should find an author by id', async () => {
		const data = AuthorDataBuilder()
		const author = await prisma.author.create({ data })
		const result = await repository.findById(author.id)

		expect(result).toStrictEqual(author)
	})

	it('should create a author', async () => {
		const data = AuthorDataBuilder()
		const author = await repository.create(data)

		expect(author).toMatchObject(data)
	})

	it('should throws an error when updating a author not found', async () => {
		const data = AuthorDataBuilder()
		const id = crypto.randomUUID()
		const author = {
			id,
			...data,
		}

		await expect(repository.update(author)).rejects.toThrow(
			new NotFoundError(`Author not found using ID ${id}`),
		)
	})

	it('should update a author', async () => {
		const data = AuthorDataBuilder()
		const author = await prisma.author.create({ data })
		const result = await repository.update({
			...author,
			name: 'new name',
		})

		expect(result.name).toBe('new name')
	})

	it('should throws an error when deleting a author not found', async () => {
		const id = crypto.randomUUID()

		await expect(repository.delete(id)).rejects.toThrow(
			new NotFoundError(`Author not found using ID ${id}`),
		)
	})

	it('should update a author', async () => {
		const data = AuthorDataBuilder()
		const author = await prisma.author.create({ data })
		const result = await repository.delete(author.id)

		expect(result).toMatchObject(author)
	})

	it('should return null when it does not find an author with the email provided', async () => {
		const result = await repository.findByEmail('a@a.com')
		expect(result).toBeNull()
	})

	it('should return a author with the email provided', async () => {
		const data = AuthorDataBuilder({ email: 'a@a.com' })
		const author = await prisma.author.create({ data })
		const result = await repository.findByEmail('a@a.com')

		expect(result).toMatchObject(author)
	})

	describe('search method', () => {
		it('should only apply pagination when the parameters are null', async () => {
			const createdAt = new Date()
			const data = []
			const arrange = Array(16).fill(AuthorDataBuilder())

			arrange.forEach((author, index) => {
				const timestamp = createdAt.getTime() + index
				data.push({
					...author,
					email: `author-${index}@a.com`,
					createdAt: new Date(timestamp),
				})
			})

			await prisma.author.createMany({ data })
			const result = await repository.search({})

			expect(result.total).toBe(16)
			expect(result.items.length).toBe(15)

			result.items.forEach((item) => {
				expect(item.id).toBeDefined()
			})

			result.items.reverse().forEach((item, index) => {
				expect(item.email).toBe(`author-${index + 1}@a.com`)
			})
		})

		it('should apply pagination and ordering', async () => {
			const createdAt = new Date()
			const data = []
			const arrange = 'badec'

			arrange.split('').forEach((author, index) => {
				const timestamp = createdAt.getTime() + index
				data.push({
					...AuthorDataBuilder({ name: author }),
					email: `author-${index}@a.com`,
					createdAt: new Date(timestamp),
				})
			})

			await prisma.author.createMany({ data })
			const firstPageResult = await repository.search({
				page: 1,
				perPage: 2,
				sort: 'name',
				sortDir: 'asc',
			})

			expect(firstPageResult.items[0]).toMatchObject(data[1])
			expect(firstPageResult.items[1]).toMatchObject(data[0])

			const secondPageResult = await repository.search({
				page: 2,
				perPage: 2,
				sort: 'name',
				sortDir: 'asc',
			})

			expect(secondPageResult.items[0]).toMatchObject(data[4])
			expect(secondPageResult.items[1]).toMatchObject(data[2])
		})

		it('should apply pagination, filter and ordering', async () => {
			const createdAt = new Date()
			const data = []
			const arrange = ['test', 'a', 'TEST', 'b', 'Test']

			arrange.forEach((author, index) => {
				const timestamp = createdAt.getTime() + index
				data.push({
					...AuthorDataBuilder({ name: author }),
					email: `author-${index}@a.com`,
					createdAt: new Date(timestamp),
				})
			})

			await prisma.author.createMany({ data })
			const firstPageResult = await repository.search({
				page: 1,
				perPage: 2,
				sort: 'name',
				sortDir: 'asc',
				filter: 'TEST',
			})

			expect(firstPageResult.items[0]).toMatchObject(data[0])
			expect(firstPageResult.items[1]).toMatchObject(data[4])

			const secondPageResult = await repository.search({
				page: 2,
				perPage: 2,
				sort: 'name',
				sortDir: 'asc',
				filter: 'TEST',
			})

			expect(secondPageResult.items[0]).toMatchObject(data[2])
			expect(secondPageResult.items.length).toBe(1)
		})
	})
})
