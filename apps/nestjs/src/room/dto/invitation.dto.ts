import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class InvitationDto {
	@Type(() => Number)
	@IsNumber()
	@IsNotEmpty()
	@IsOptional()
	sub: number;

	@Type(() => Date)
	@IsDate()
	@IsNotEmpty()
	@IsOptional()
	exp: Date;
}
