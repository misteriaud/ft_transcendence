import { e_room_access } from '@prisma/client';
import { IsNotEmpty, IsString, IsEnum, ValidateIf, IsIn } from 'class-validator';

export class RoomDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsEnum(e_room_access)
	@IsIn([e_room_access.PUBLIC, e_room_access.PROTECTED, e_room_access.PRIVATE])
	@IsNotEmpty()
	access: e_room_access;

	@IsString()
	@IsNotEmpty()
	@ValidateIf((o) => o.access === e_room_access.PROTECTED)
	password: string;
}
