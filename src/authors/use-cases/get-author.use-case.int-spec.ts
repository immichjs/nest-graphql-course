import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'node:child_process'
import { AuthorDataBuilder } from '../helpers/author-data-builder'
import { AuthorsPrismaRepository } from '../repositories/authors-prisma.repository'
import { GetAuthorUseCase } from './get-author.use-case'
import { BadRequestError } from '@/shared/errors/bad-request.error'
import { NotFoundError } from '@/shared/errors/not-found.error'

describe('GetAuthorUseCase Integration Tests', () => {
	let module: TestingModule
	let repository: AuthorsPrismaRepository
	let useCase: GetAuthorUseCase.UseCase
	const prisma = new PrismaClient()

	beforeAll(async () => {
		execSync('npm run prisma:migratetest')
		await prisma.$connect()
		module = await Test.createTestingModule({}).compile()
		repository = new AuthorsPrismaRepository(prisma as any)
		useCase = new GetAuthorUseCase.UseCase(repository)
	}, 20000)

	beforeEach(async () => {
		await prisma.author.deleteMany()
	})

	afterAll(async () => {
		await module.close()
	})

	it('should throws an error when the id is not found', async () => {
		const id = crypto.randomUUID()
		await expect(() => useCase.execute({ id })).rejects.toBeInstanceOf(
			NotFoundError,
		)
	})

	it('shoud be able to get author by id', async () => {
		const data = AuthorDataBuilder()
		const author = await prisma.author.create({ data })
		const result = await useCase.execute({ id: author.id })

		expect(result).toStrictEqual(author)
	})
})
