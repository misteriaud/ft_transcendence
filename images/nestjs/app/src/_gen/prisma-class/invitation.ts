import { Member } from './member';
import { ApiProperty } from '@nestjs/swagger';

export class Invitation {
	@ApiProperty({ type: Number })
	id: number;

	@ApiProperty({ type: () => Member })
	iss: Member;

	@ApiProperty({ type: Number })
	room_id: number;

	@ApiProperty({ type: Number })
	user_id: number;

	@ApiProperty({ type: String })
	token: string;
}
