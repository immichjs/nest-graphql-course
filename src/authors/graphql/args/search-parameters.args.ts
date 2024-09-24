import { ArgsType, Field, Int } from '@nestjs/graphql'
import {
	IsIn,
	IsInt,
	IsNumber,
	IsOptional,
	IsString,
	Min,
} from 'class-validator'

@ArgsType()
export class SearchParametersArgs {
	@IsInt()
	@Min(1)
	@IsOptional()
	@Field(() => Int, { nullable: true })
	page?: number

	@IsInt()
	@Min(1)
	@IsOptional()
	@Field(() => Int, { nullable: true })
	perPage?: number

	@IsString()
	@IsOptional()
	@Field({ nullable: true })
	sort?: string

	@IsString()
	@IsIn(['asc', 'desc'])
	@IsOptional()
	@Field({ nullable: true })
	sortDir?: 'asc' | 'desc'

	@IsString()
	@IsOptional()
	@Field({ nullable: true })
	filter?: string
}
