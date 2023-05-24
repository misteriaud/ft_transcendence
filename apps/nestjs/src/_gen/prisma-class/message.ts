import { Member } from './member';
import { ApiProperty } from '@nestjs/swagger';

export class Message {
	@ApiProperty({ type: Number })
	id: number;

	@ApiProperty({ type: () => Member })
	author: Member;

	@ApiProperty({ type: Number })
	room_id: number;

	@ApiProperty({ type: Number })
	user_id: number;

	@ApiProperty({ type: String })
	content: string;

	@ApiProperty({ type: Date })
	createdAt: Date;

	@ApiProperty({ type: Date })
	updatedAt: Date;
}
