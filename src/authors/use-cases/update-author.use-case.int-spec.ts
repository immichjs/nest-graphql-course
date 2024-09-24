import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'node:child_process'
import { AuthorDataBuilder } from '../helpers/author-data-builder'
import { AuthorsPrismaRepository } from '../repositories/authors-prisma.repository'
import { UpdateAuthorUseCase } from './update-author.use-case'
import { BadRequestError } from '@/shared/errors/bad-request.error'
import { NotFoundError } from '@/shared/errors/not-found.error'
import { ConflictError } from '@/shared/errors/conflict.error'

describe('UpdateAuthorUseCase Integration Tests', () => {
	let module: TestingModule
	let repository: AuthorsPrismaRepository
	let useCase: UpdateAuthorUseCase.UseCase
	const prisma = new PrismaClient()

	beforeAll(async () => {
		execSync('npm run prisma:migratetest')
		await prisma.$connect()
		module = await Test.createTestingModule({}).compile()
		repository = new AuthorsPrismaRepository(prisma as any)
		useCase = new UpdateAuthorUseCase.UseCase(repository)
	}, 20000)

	beforeEach(async () => {
		await prisma.author.deleteMany()
	})

	afterAll(async () => {
		await module.close()
	})

	it('should throws an error when provided email is duplicated', async () => {
		const data = AuthorDataBuilder({ email: 'a@a.com' })
		const firstAuthor = await prisma.author.create({ data })
		const secondAuthor = await prisma.author.create({
			data: AuthorDataBuilder(),
		})

		secondAuthor.email = firstAuthor.email

		await expect(() => useCase.execute(secondAuthor)).rejects.toBeInstanceOf(
			ConflictError,
		)
	})

	it('should be able to update author', async () => {
		const data = AuthorDataBuilder()
		const author = await prisma.author.create({ data })
		const result = await useCase.execute({
			...author,
			name: 'Name updated',
			email: 'a@a.com',
		})

		expect(result.name).toBe('Name updated')
		expect(result.email).toBe('a@a.com')
	})
})
