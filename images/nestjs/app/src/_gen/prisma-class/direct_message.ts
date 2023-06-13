import { Friends } from './friends';
import { ApiProperty } from '@nestjs/swagger';

export class DirectMessage {
	@ApiProperty({ type: Number })
	id: number;

	@ApiProperty({ type: () => Friends })
	user: Friends;

	@ApiProperty({ type: Number })
	author_id: number;

	@ApiProperty({ type: Number })
	receiver_id: number;

	@ApiProperty({ type: String })
	content: string;

	@ApiProperty({ type: Date })
	createdAt: Date;

	@ApiProperty({ type: Date })
	updatedAt: Date;
}
