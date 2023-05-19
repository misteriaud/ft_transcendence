import { BadRequestException, ConflictException, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Invitation, Member, Room, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoomGetService {
	constructor(private prisma: PrismaService) {}

	async getRoom(context: ExecutionContext): Promise<Room> {
		const request = context.switchToHttp().getRequest();

		if (request.room) {
			return request.room;
		}

		const room_id = parseInt(request.params.id);

		if (isNaN(room_id)) {
			throw new BadRequestException('Invalid room id');
		}

		const room = await this.prisma.room.findUnique({
			where: { id: room_id },
		});

		if (!room) {
			throw new NotFoundException('Room not found');
		}
		request.room = room;
		return room;
	}

	async getMember(context: ExecutionContext): Promise<Member> {
		const request = context.switchToHttp().getRequest();

		if (request.member) {
			return request.member;
		}

		const room: Room = await this.getRoom(context);
		const member_id = parseInt(request.params.member_id);

		if (isNaN(member_id)) {
			throw new BadRequestException('Invalid member id');
		}

		const member = await this.prisma.member.findUnique({
			where: {
				room_id_user_id: {
					room_id: room.id,
					user_id: member_id,
				},
			},
		});

		if (!member) {
			throw new NotFoundException('Member not found');
		}
		if (request.route.path !== '/rooms/:id/ban/:member_id' && request.route.path !== '/rooms/:id/unban/:member_id') {
			if (member.banned) {
				throw new ConflictException('This member is banned from this room');
			}
		}
		request.member = member;
		return member;
	}

	async getUserAsMember(context: ExecutionContext): Promise<Member> {
		const request = context.switchToHttp().getRequest();

		if (request.userAsMember) {
			return request.userAsMember;
		}

		const user: User = request.user;
		const room: Room = await this.getRoom(context);

		const userAsMember = await this.prisma.member.findUnique({
			where: {
				room_id_user_id: {
					room_id: room.id,
					user_id: user.id,
				},
			},
		});

		if (!userAsMember) {
			throw new ForbiddenException('You are not a member of this room');
		}
		if (userAsMember.banned) {
			throw new ForbiddenException('You are banned from this room');
		}
		request.userAsMember = userAsMember;
		return userAsMember;
	}

	async getInvitation(context: ExecutionContext): Promise<Invitation> {
		const request = context.switchToHttp().getRequest();

		if (request.invitation) {
			return request.invitation;
		}

		const room: Room = await this.getRoom(context);
		const invitation_token = request.params.invitation_token;

		const invitation = await this.prisma.invitation.findFirst({
			where: {
				room_id: room.id,
				token: invitation_token,
			},
		});

		if (!invitation) {
			throw new NotFoundException('Invitation not found');
		}
		request.invitation = invitation;
		return invitation;
	}
}
