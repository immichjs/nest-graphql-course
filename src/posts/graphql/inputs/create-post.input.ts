import { Field, InputType } from '@nestjs/graphql'
import { IsNotEmpty, IsString, IsUUID } from 'class-validator'

@InputType()
export class CreatePostInput {
	@IsString()
	@IsNotEmpty()
	@Field()
	title: string

	@IsString()
	@IsNotEmpty()
	@Field()
	content: string

	@IsString()
	@IsUUID()
	@IsNotEmpty()
	@Field()
	authorId: string
}
