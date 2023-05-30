import { Member } from './member';
import { Friends } from './friends';
import { e_room_access } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Room {
	@ApiProperty({ type: Number })
	id: number;

	@ApiPropertyOptional({ type: String })
	name?: string;

	@ApiProperty({ enum: e_room_access, enumName: 'e_room_access' })
	access: e_room_access = e_room_access.PUBLIC;

	@ApiPropertyOptional({ type: String })
	hash?: string;

	@ApiProperty({ isArray: true, type: () => Member })
	members: Member[];

	@ApiPropertyOptional({ type: () => Friends })
	friends?: Friends;
}
