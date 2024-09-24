import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'node:child_process'
import { AuthorDataBuilder } from '../helpers/author-data-builder'
import { AuthorsPrismaRepository } from '../repositories/authors-prisma.repository'
import { ListAuthorsUseCase } from './list-authors.use-case'
import { BadRequestError } from '@/shared/errors/bad-request.error'
import { NotFoundError } from '@/shared/errors/not-found.error'

describe('ListAuthorsUseCase Integration Tests', () => {
	let module: TestingModule
	let repository: AuthorsPrismaRepository
	let useCase: ListAuthorsUseCase.UseCase
	const prisma = new PrismaClient()

	beforeAll(async () => {
		execSync('npm run prisma:migratetest')
		await prisma.$connect()
		module = await Test.createTestingModule({}).compile()
		repository = new AuthorsPrismaRepository(prisma as any)
		useCase = new ListAuthorsUseCase.UseCase(repository)
	}, 20000)

	beforeEach(async () => {
		await prisma.author.deleteMany()
	})

	afterAll(async () => {
		await module.close()
	})

	describe('search method', () => {
		it('should only apply pagination when the parameters are null', async () => {
			const createdAt = new Date()
			const data = []
			const arrange = Array(3).fill(AuthorDataBuilder())

			arrange.forEach((author, index) => {
				const timestamp = createdAt.getTime() + index
				data.push({
					...author,
					email: `a-${index}@a.com`,
					createdAt: new Date(timestamp),
				})
			})

			await prisma.author.createMany({ data })
			const result = await useCase.execute({})

			expect(result).toMatchObject({
				items: data.reverse(),
				total: 3,
				currentPage: 1,
				perPage: 15,
				lastPage: 1,
			})

			result.items.reverse().forEach((item, index) => {
				expect(item.email).toBe(`a-${index}@a.com`)
			})
		})

		it('should apply pagination, filter and ordering', async () => {
			const createdAt = new Date()
			const data = []
			const arrange = ['test', 'a', 'TEST', 'b', 'Test']

			arrange.forEach((author, index) => {
				const timestamp = createdAt.getTime() + index
				data.push({
					...AuthorDataBuilder({ name: author }),
					email: `a-${index}@a.com`,
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
			expect(firstPageResult).toMatchObject({
				items: [data[0], data[4]],
				total: 3,
				currentPage: 1,
				perPage: 2,
				lastPage: 2,
			})

			const secondPageResult = await repository.search({
				page: 2,
				perPage: 2,
				sort: 'name',
				sortDir: 'asc',
				filter: 'TEST',
			})
			expect(secondPageResult).toMatchObject({
				items: [data[2]],
				total: 3,
				currentPage: 2,
				perPage: 2,
				lastPage: 2,
			})
		})
	})
})
