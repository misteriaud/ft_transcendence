import { User } from './user';
import { Room } from './room';
import { ApiProperty } from '@nestjs/swagger';

export class Friends {
	@ApiProperty({ type: () => User })
	userA: User;

	@ApiProperty({ type: Number })
	userA_id: number;

	@ApiProperty({ type: () => User })
	userB: User;

	@ApiProperty({ type: Number })
	userB_id: number;

	@ApiProperty({ type: () => Room })
	room: Room;

	@ApiProperty({ type: Number })
	room_id: number;
}
