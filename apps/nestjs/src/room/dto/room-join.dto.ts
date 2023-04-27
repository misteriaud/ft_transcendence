import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RoomJoinDto {
	@IsString()
	@IsNotEmpty()
	@IsOptional()
	password: string;
}
