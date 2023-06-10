import { User } from './user';
import { e_match_mod, e_match_state } from '@prisma/client';
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

	@ApiProperty({ enum: e_match_mod, enumName: 'e_match_mod' })
	mod: e_match_mod = e_match_mod.NORMAL;

	@ApiProperty({ enum: e_match_state, enumName: 'e_match_state' })
	state: e_match_state = e_match_state.FINISHED;

	@ApiProperty({ type: Date })
	createdAt: Date;

	@ApiProperty({ type: Date })
	updatedAt: Date;
}
