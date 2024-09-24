import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'node:child_process'
import { NotFoundError } from '@/shared/errors/not-found.error'
import { AuthorDataBuilder } from '../helpers/author-data-builder'
import { AuthorsPrismaRepository } from '../repositories/authors-prisma.repository'
import { CreateAuthorUseCase } from './create-author.use-case'
import { ConflictError } from '@/shared/errors/conflict.error'
import { BadRequestError } from '@/shared/errors/bad-request.error'

describe('CreateAuthorUseCase Integration Tests', () => {
	let module: TestingModule
	let repository: AuthorsPrismaRepository
	let useCase: CreateAuthorUseCase.UseCase
	const prisma = new PrismaClient()

	beforeAll(async () => {
		execSync('npm run prisma:migratetest')
		await prisma.$connect()
		module = await Test.createTestingModule({}).compile()
		repository = new AuthorsPrismaRepository(prisma as any)
		useCase = new CreateAuthorUseCase.UseCase(repository)
	}, 20000)

	beforeEach(async () => {
		await prisma.author.deleteMany()
	})

	afterAll(async () => {
		await module.close()
	})

	it('should create a author', async () => {
		const data = AuthorDataBuilder()
		const author = await useCase.execute(data)

		expect(author).toMatchObject(data)
		expect(author.createdAt).toBeInstanceOf(Date)
		expect(author).toMatchObject(data)
	})

	it('should not be able to create with smae email twice', async () => {
		const data = AuthorDataBuilder({ email: 'a@a.com' })
		await useCase.execute(data)
		await expect(() => useCase.execute(data)).rejects.toBeInstanceOf(
			ConflictError,
		)
	})

	it('should throws error when name not provided', async () => {
		const data = AuthorDataBuilder()
		data.name = null
		await expect(() => useCase.execute(data)).rejects.toBeInstanceOf(
			BadRequestError,
		)
	})

	it('should throws error when email not provided', async () => {
		const data = AuthorDataBuilder()
		data.email = null
		await expect(() => useCase.execute(data)).rejects.toBeInstanceOf(
			BadRequestError,
		)
	})
})
