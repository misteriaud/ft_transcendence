export interface i_me {
	id: number;
	username: string;
	login42: string;
	avatar?: string;
	twoFactorEnabled: boolean;
	twoFactorSecret?: string;
	friends: i_friends[];
	friendOf: i_friends[];
	friendRequestsSent: i_friend_requests[];
	friendRequestsReceived: i_friend_requests[];
	blocked: i_blocked[];
	blockedBy: i_blocked[];
	memberOf: i_member[];
	history: i_match[];
	createdAt: string;
	updatedAt: string;
}

export interface i_user {
	id: number;
	username: string;
	login42: string;
	avatar?: string;
	history: i_match[];
	createdAt: string;
}

export interface i_friend_requests {
	userA: i_user;
	userA_id: number;
	userB: i_user;
	userB_id: number;
	room_id: number;
}

export interface i_friends {
	userA: i_user;
	userA_id: number;
	userB: i_user;
	userB_id: number;
}

export interface i_blocked {
	userA: i_user;
	userA_id: number;
	userB: i_user;
	userB_id: number;
}

export interface i_match {
	id: number;
	playedBy: i_user[];
	score1: number;
	score2: number;
	mod: e_match_mod;
	state: e_match_state;
	createdAt: string;
	updatedAt: string;
}

export interface i_room {
	id: number;
	name?: string;
	access: e_room_access;
	hash?: string;
	members: i_member[];
}

export interface i_member {
	room: i_room;
	room_id: number;
	user: i_user;
	user_id: number;
	role: e_member_role;
	muted: boolean;
	muted_until: string;
	banned: boolean;
	messages: i_message[];
	invitations: i_invitation[];
}

export interface i_message {
	id: number;
	author: i_member;
	room_id: number;
	user_id: number;
	content: string;
	createdAt: string;
}

export interface i_invitation {
	id: number;
	iss: i_member;
	room_id: number;
	user_id: number;
	token: string;
}

export enum e_user_status {
	ONLINE = 'ONLINE',
	INQUEUE = 'INQUEUE',
	INGAME = 'INGAME',
	OFFLINE = 'OFFLINE'
}

export enum e_match_mod {
	NORMAL = 'NORMAL',
	HARDCORE = 'HARDCORE'
}

export enum e_match_state {
	FINISHED = 'FINISHED',
	ABANDONED = 'ABANDONED'
}

export enum e_room_access {
	PUBLIC = 'PUBLIC',
	PROTECTED = 'PROTECTED',
	PRIVATE = 'PRIVATE',
	DIRECT_MESSAGE = 'DIRECT_MESSAGE'
}

export enum e_member_role {
	OWNER = 'OWNER',
	ADMIN = 'ADMIN',
	MEMBER = 'MEMBER'
}

// websocket

export type e_invitation = {
	id: string;
	player1id: number;
	player2id: number;
	mode: 'NORMAL' | 'HARDCORE';
};
