import { User } from './user';
import { e_match_map, e_match_state } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class Match {
	@ApiProperty({ type: Number })
	id: number;

	@ApiProperty({ isArray: true, type: () => User })
	playedBy: User[];

	@ApiProperty({ type: Number })
	score1: number;

	@ApiProperty({ type: Number })
	score2: number;

	@ApiProperty({ enum: e_match_map, enumName: 'e_match_map' })
	map: e_match_map = e_match_map.CLASSIC;

	@ApiProperty({ type: Boolean })
	powerUp: boolean;

	@ApiProperty({ enum: e_match_state, enumName: 'e_match_state' })
	state: e_match_state = e_match_state.PREPARATION;

	@ApiProperty({ type: Date })
	createdAt: Date;

	@ApiProperty({ type: Date })
	updatedAt: Date;
}
