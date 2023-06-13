import { Room } from './room';
import { User } from './user';
import { Message } from './message';
import { Invitation } from './invitation';
import { e_member_role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class Member {
	@ApiProperty({ type: () => Room })
	room: Room;

	@ApiProperty({ type: Number })
	room_id: number;

	@ApiProperty({ type: () => User })
	user: User;

	@ApiProperty({ type: Number })
	user_id: number;

	@ApiProperty({ enum: e_member_role, enumName: 'e_member_role' })
	role: e_member_role = e_member_role.MEMBER;

	@ApiProperty({ type: Boolean })
	muted: boolean;

	@ApiProperty({ type: Date })
	muted_until: Date;

	@ApiProperty({ type: Boolean })
	banned: boolean;

	@ApiProperty({ isArray: true, type: () => Message })
	messages: Message[];

	@ApiProperty({ isArray: true, type: () => Invitation })
	invitations: Invitation[];
}
