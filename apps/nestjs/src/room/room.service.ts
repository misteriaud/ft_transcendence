import { BadRequestException, ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Member, e_member_role, e_room_access } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { InvitationDto, RoomDto, RoomJoinDto, RoomMuteDto } from './dto';
import { PrismaRoomService } from './prismaRoom.service';

@Injectable()
export class RoomService {
	constructor(private prismaRoom: PrismaRoomService, private prisma: PrismaService, private jwt: JwtService, private config: ConfigService) {}

	// ROOM

	// Create a room
	async create(user_id: number, dto: RoomDto) {
		let hash: string | null;

		if (dto.access !== e_room_access.PROTECTED) {
			delete dto.password;
			hash = null;
		} else {
			hash = await argon.hash(dto.password);
		}
		return await this.prismaRoom.create(user_id, dto.name, dto.access, hash);
	}

	// Get PUBLIC and PROTECTED rooms
	async getPublicOrProtected(user_id: number) {
		return await this.prismaRoom.getPublicOrProtected(user_id);
	}

	// Get a room
	async get(room_id: number) {
		return await this.prismaRoom.get(room_id);
	}

	// Edit a room
	async edit(room_id: number, dto: RoomDto) {
		let hash: string | null;

		if (dto.access !== e_room_access.PROTECTED) {
			delete dto.password;
			hash = null;
		} else {
			hash = await argon.hash(dto.password);
		}
		return await this.prismaRoom.edit(room_id, dto.name, dto.access, hash);
	}

	// Delete a room
	async delete(room_id: number) {
		await this.prismaRoom.delete(room_id);
	}

	// Join a room
	async join(user_id: number, room_id: number, room_access: e_room_access, room_hash: string | null, dto: RoomJoinDto) {
		const member = await this.prismaRoom.getMember(room_id, user_id);

		if (member) {
			if (member.banned) {
				throw new ForbiddenException('You are banned from this room');
			} else {
				throw new ConflictException('You are already a member of this room');
			}
		}
		if (room_access !== 'PUBLIC' && room_access !== 'PROTECTED') {
			throw new ForbiddenException('This room is not public nor protected');
		}
		if (room_access === 'PROTECTED' && (!dto || !dto.password)) {
			throw new BadRequestException('Missing password');
		}
		if (room_access === 'PROTECTED' && !(await argon.verify(room_hash, dto.password))) {
			throw new UnauthorizedException('Incorrect password');
		}
		return await this.prismaRoom.createMember(room_id, user_id);
	}

	// Join with invitation
	async joinWithInvitation(user_id: number, room_id: number, room_access: e_room_access, invitation: string) {
		let payload;

		try {
			payload = await this.jwt.verifyAsync(invitation, {
				secret: this.config.get('JWT_SECRET'),
			});
		} catch (e) {
			if (e.name === 'TokenExpiredError') {
				throw new UnauthorizedException('Invitation has expired');
			} else {
				throw new UnauthorizedException('Invalid invitation');
			}
		}

		if (payload.room_id !== room_id) {
			throw new UnauthorizedException('The invitation and the room do not match');
		}
		if (payload.sub && payload.sub !== user_id) {
			throw new UnauthorizedException('You are not the subject of this invitation');
		}

		const iss = await this.prismaRoom.getMember(room_id, payload.iss);

		if (!iss) {
			throw new UnauthorizedException('The issuer of this invitation is no longer a member of the room');
		}
		if (iss.banned) {
			throw new UnauthorizedException('The issuer of this invitation is banned from the room');
		}
		if (iss.role !== 'ADMIN' && iss.role !== 'OWNER') {
			throw new UnauthorizedException('The issuer of this invitation is no longer an admin of the room');
		}

		const member = await this.prismaRoom.getMember(room_id, user_id);

		if (member) {
			if (member.banned) {
				throw new ForbiddenException('You are banned from this room');
			} else {
				throw new ConflictException('You are already a member of this room');
			}
		}
		if (room_access !== 'PUBLIC' && room_access !== 'PROTECTED' && room_access !== 'PRIVATE') {
			throw new ForbiddenException('This room is not public nor protected nor private');
		}
		return await this.prismaRoom.createMember(room_id, user_id);
	}

	// Leave a room
	async leave(user_id: number, room_id: number) {
		await this.prismaRoom.deleteMember(room_id, user_id);
	}

	// MEMBER

	// Promote a member
	async promote(member: Member) {
		if (member.role === e_member_role.ADMIN) {
			throw new ConflictException('This member is already an administrator');
		}
		return await this.prismaRoom.editMember(member.room_id, member.user_id, 'ADMIN', null, null, null);
	}

	// Demote a member
	async demote(member: Member) {
		if (member.role !== e_member_role.ADMIN) {
			throw new ConflictException('This member is not an administrator');
		}
		return await this.prismaRoom.editMember(member.room_id, member.user_id, 'MEMBER', null, null, null);
	}

	// Kick a member
	async kick(member: Member) {
		await this.prismaRoom.deleteMember(member.room_id, member.user_id);
	}

	// Mute member
	async mute(member: Member, dto: RoomMuteDto) {
		return await this.prismaRoom.editMember(member.room_id, member.user_id, null, true, dto.mute_until, null);
	}

	// Unmute member
	async unmute(member: Member) {
		if (!member.muted) {
			throw new ConflictException('This member is not muted');
		}
		return await this.prismaRoom.editMember(member.room_id, member.user_id, null, false, new Date(Date.now()), null);
	}

	// Ban member
	async ban(member: Member) {
		if (member.banned) {
			throw new ConflictException('This member is already banned');
		}
		return await this.prismaRoom.editMember(member.room_id, member.user_id, null, null, null, true);
	}

	// Unban member
	async unban(member: Member) {
		if (!member.banned) {
			throw new ConflictException('This member is not banned');
		}
		return await this.prismaRoom.editMember(member.room_id, member.user_id, null, null, null, false);
	}

	// INVITATION

	// Create an invitation
	async createInvitation(user_id: number, room_id: number, dto: InvitationDto) {
		const payload = {
			iss: user_id,
			room_id: room_id,
			sub: dto.sub,
			exp: dto.exp?.getTime() / 1000,
		};

		if (!dto.sub) {
			delete payload.sub;
		}
		if (!dto.exp) {
			delete payload.exp;
		}

		const token = await this.jwt.signAsync(payload, {
			secret: this.config.get('JWT_SECRET'),
			noTimestamp: !dto.exp,
		});

		const invitation = await this.prismaRoom.getInvitation(token);

		if (invitation) {
			throw new ConflictException('This invitation already exists');
		}
		return await this.prismaRoom.createInvitation(room_id, user_id, token);
	}

	// Get all invitations
	async getAllInvitations(room_id: number) {
		return await this.prismaRoom.getAllInvitations(room_id);
	}

	// Delete an invitation
	async deleteInvitation(token: string) {
		await this.prismaRoom.deleteInvitation(token);
	}
}
