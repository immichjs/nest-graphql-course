import { Test, TestingModule } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'node:child_process'
import { AuthorDataBuilder } from '../helpers/author-data-builder'
import { AuthorsPrismaRepository } from '../repositories/authors-prisma.repository'
import { DeleteAuthorUseCase } from './delete-author.use-case'

describe('DeleteAuthorUseCase Integration Tests', () => {
	let module: TestingModule
	let repository: AuthorsPrismaRepository
	let useCase: DeleteAuthorUseCase.UseCase
	const prisma = new PrismaClient()

	beforeAll(async () => {
		execSync('npm run prisma:migratetest')
		await prisma.$connect()
		module = await Test.createTestingModule({}).compile()
		repository = new AuthorsPrismaRepository(prisma as any)
		useCase = new DeleteAuthorUseCase.UseCase(repository)
	}, 20000)

	beforeEach(async () => {
		await prisma.author.deleteMany()
	})

	afterAll(async () => {
		await module.close()
	})

	it('should delete a author', async () => {
		const data = AuthorDataBuilder({ email: 'a@a.com' })
		const author = await prisma.author.create({ data })

		const result = await useCase.execute({ id: author.id })

		expect(result).toMatchObject(author)

		const authors = await prisma.author.findMany()
		expect(authors).toHaveLength(0)
	})
})
