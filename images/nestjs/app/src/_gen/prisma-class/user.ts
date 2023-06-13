import { Friends } from './friends';
import { Blocked } from './blocked';
import { FriendRequests } from './friend_requests';
import { Member } from './member';
import { Match } from './match';
import { e_user_status } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class User {
	@ApiProperty({ type: Number })
	id: number;

	@ApiProperty({ type: String })
	username: string;

	@ApiProperty({ type: String })
	login42: string;

	@ApiPropertyOptional({ type: String })
	avatar?: string;

	@ApiProperty({ type: Boolean })
	twoFactorEnabled: boolean;

	@ApiPropertyOptional({ type: String })
	twoFactorSecret?: string;

	@ApiProperty({ enum: e_user_status, enumName: 'e_user_status' })
	status: e_user_status = e_user_status.ONLINE;

	@ApiProperty({ isArray: true, type: () => Friends })
	friends: Friends[];

	@ApiProperty({ isArray: true, type: () => Friends })
	friendOf: Friends[];

	@ApiProperty({ isArray: true, type: () => Blocked })
	blocked: Blocked[];

	@ApiProperty({ isArray: true, type: () => Blocked })
	blockedBy: Blocked[];

	@ApiProperty({ isArray: true, type: () => FriendRequests })
	friendRequestsSent: FriendRequests[];

	@ApiProperty({ isArray: true, type: () => FriendRequests })
	friendRequestsReceived: FriendRequests[];

	@ApiProperty({ isArray: true, type: () => Member })
	memberOf: Member[];

	@ApiProperty({ isArray: true, type: () => Match })
	history: Match[];

	@ApiProperty({ type: Date })
	createdAt: Date;

	@ApiProperty({ type: Date })
	updatedAt: Date;
}
