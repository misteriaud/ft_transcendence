export interface User {
	id: number;
	username: string;
	login42: string;
	avatar?: string;
	twoFactorEnabled: boolean;
	twoFactorSecret?: string;
	status: e_user_status;
	friends: Friends[];
	friendOf: Friends[];
	friendRequestsSent: FriendRequests[];
	friendRequestsReceived: FriendRequests[];
	blocked: Blocked[];
	blockedBy: Blocked[];
	memberOf: Member[];
	history: Match[];
	createdAt: Date;
	updatedAt: Date;
}

// eslint-disable-next-line
export interface Friends {}

// eslint-disable-next-line
export interface FriendRequests {}

// eslint-disable-next-line
export interface Blocked {}

// eslint-disable-next-line
export interface Match {}

// eslint-disable-next-line
export interface Room {}

// eslint-disable-next-line
export interface Member {}

// eslint-disable-next-line
export interface Message {}

// eslint-disable-next-line
export interface Invitation {}

export enum e_user_status {
	ONLINE,
	INQUEUE,
	INGAME,
	OFFLINE
}

export enum e_match_map {
	CLASSIC
}

export enum e_match_state {
	PREPARATION,
	INPROGRESS,
	FINISHED
}

export enum e_room_access {
	PUBLIC,
	PROTECTED,
	PRIVATE,
	DIRECT_MESSAGE
}

export enum e_member_role {
	OWNER,
	ADMIN,
	MEMBER
}
