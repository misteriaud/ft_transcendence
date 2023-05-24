import { User } from './user';
import { ApiProperty } from '@nestjs/swagger';

export class Blocked {
	@ApiProperty({ type: () => User })
	userA: User;

	@ApiProperty({ type: Number })
	userA_id: number;

	@ApiProperty({ type: () => User })
	userB: User;

	@ApiProperty({ type: Number })
	userB_id: number;
}
