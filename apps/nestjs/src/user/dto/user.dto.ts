import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

export class UserDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(32)
	@IsOptional()
	username: string;

	@IsString()
	@IsNotEmpty()
	@IsOptional()
	twoFactorEnabled: string;
}
