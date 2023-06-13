import { User } from '@prisma/client';

export interface i_blocked {
	userA: User;
	userB: User;
}
