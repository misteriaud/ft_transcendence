import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class RoomInviteDto {
	@Type(() => Number)
	@IsNumber()
	@IsNotEmpty()
	@IsOptional()
	user_id: number;

	@Type(() => Date)
	@IsDate()
	@IsNotEmpty()
	@IsOptional()
	expiration_date: Date;
}
