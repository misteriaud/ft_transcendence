import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsOptional, MaxLength, IsBoolean } from 'class-validator';

export class UserDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(32)
	@IsOptional()
	username: string;

	@Type(() => Boolean)
	@IsBoolean()
	@IsNotEmpty()
	@IsOptional()
	twoFactorAuth: boolean;
}
