import { User as _User } from './user';
import { Friends as _Friends } from './friends';
import { Blocked as _Blocked } from './blocked';
import { FriendRequests as _FriendRequests } from './friend_requests';
import { Match as _Match } from './match';
import { Room as _Room } from './room';
import { Member as _Member } from './member';
import { Message as _Message } from './message';
import { Invitation as _Invitation } from './invitation';

export namespace PrismaModel {
	export class User extends _User {}
	export class Friends extends _Friends {}
	export class Blocked extends _Blocked {}
	export class FriendRequests extends _FriendRequests {}
	export class Match extends _Match {}
	export class Room extends _Room {}
	export class Member extends _Member {}
	export class Message extends _Message {}
	export class Invitation extends _Invitation {}

	export const extraModels = [User, Friends, Blocked, FriendRequests, Match, Room, Member, Message, Invitation];
}
