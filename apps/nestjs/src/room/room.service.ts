import { BadRequestException, ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Member, Room, User, e_member_role, e_room_access } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoomDto, RoomInviteDto, RoomJoinDto, RoomMuteDto } from './dto';

@Injectable()
export class RoomService {
	constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService) {}

	// Create a room
	async create(user: User, dto: RoomDto) {
		let hash: string | undefined;

		if (dto.access !== e_room_access.PROTECTED) {
			delete dto.password;
		} else {
			hash = await argon.hash(dto.password);
		}

		const room = await this.prisma.room.create({
			data: {
				name: dto.name,
				access: dto.access,
				hash: hash,
				members: {
					create: {
						user: {
							connect: {
								id: user.id,
							},
						},
						role: e_member_role.OWNER,
					},
				},
			},
		});
		delete room.hash;
		return room;
	}

	// Get PUBLIC and PROTECTED rooms
	async get(user: User) {
		return await this.prisma.room.findMany({
			where: {
				access: {
					in: ['PUBLIC', 'PROTECTED'],
				},
				members: {
					none: {
						user_id: user.id,
						banned: true,
					},
				},
			},
			select: {
				id: true,
				name: true,
				access: true,
			},
		});
	}

	// Edit a room
	async edit(room: Room, dto: RoomDto) {
		let hash: string | null;

		if (dto.access !== e_room_access.PROTECTED) {
			delete dto.password;
			hash = null;
		} else {
			hash = await argon.hash(dto.password);
		}

		const updatedRoom = await this.prisma.room.update({
			where: {
				id: room.id,
			},
			data: {
				name: dto.name,
				access: dto.access,
				hash: hash,
			},
		});
		delete updatedRoom.hash;
		return updatedRoom;
	}

	// Delete a room
	async delete(room: Room) {
		await this.prisma.room.delete({
			where: {
				id: room.id,
			},
		});
	}

	// Join a room
	async join(user: User, room: Room, dto: RoomJoinDto) {
		const member = await this.prisma.member.findUnique({
			where: {
				room_id_user_id: {
					room_id: room.id,
					user_id: user.id,
				},
			},
		});

		if (member) {
			if (member.banned) {
				throw new ForbiddenException('You are banned from this room');
			} else {
				throw new ConflictException('You are already a member of this room');
			}
		}
		if (room.access !== 'PUBLIC' && room.access !== 'PROTECTED') {
			throw new ForbiddenException('This room is not public nor protected');
		}
		if (room.access === 'PROTECTED' && (!dto || !dto.password)) {
			throw new BadRequestException('Missing password');
		}
		if (room.access === 'PROTECTED' && !(await argon.verify(room.hash, dto.password))) {
			throw new UnauthorizedException('Incorrect password');
		}
		return await this.prisma.member.create({
			data: {
				room: {
					connect: {
						id: room.id,
					},
				},
				user: {
					connect: {
						id: user.id,
					},
				},
			},
		});
	}

	// Generate invitation
	async generateInvitation(user: User, room: Room, dto: RoomInviteDto) {
		const payload = {
			sub: dto.user_id,
			iss: user.id,
			room_id: room.id,
			exp: dto.expiration_date?.getTime() / 1000,
		};

		if (!dto.expiration_date) {
			delete payload.exp;
		}

		const token = await this.jwt.signAsync(payload, {
			secret: this.config.get('JWT_SECRET'),
			noTimestamp: !dto.expiration_date,
		});

		return {
			room_id: room.id,
			invitation_token: token,
		};
	}

	// Join with invitation
	async joinWithInvitation(user: User, room: Room, invitation: string) {
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

		if (payload.room_id !== room.id) {
			throw new UnauthorizedException('The invitation and the room do not match');
		}
		if (payload.sub && payload.sub !== user.id) {
			throw new UnauthorizedException('You are not the subject of this invitation');
		}

		const iss = await this.prisma.member.findUnique({
			where: {
				room_id_user_id: {
					room_id: room.id,
					user_id: payload.iss,
				},
			},
		});

		if (!iss) {
			throw new UnauthorizedException('The issuer of this invitation is no longer a member of the room');
		}

		const member = await this.prisma.member.findUnique({
			where: {
				room_id_user_id: {
					room_id: room.id,
					user_id: user.id,
				},
			},
		});

		if (member) {
			if (member.banned) {
				throw new ForbiddenException('You are banned from this room');
			} else {
				throw new ConflictException('You are already a member of this room');
			}
		}
		if (room.access !== 'PUBLIC' && room.access !== 'PROTECTED' && room.access !== 'PRIVATE') {
			throw new ForbiddenException('This room is not public nor protected nor private');
		}

		return await this.prisma.member.create({
			data: {
				room: {
					connect: {
						id: room.id,
					},
				},
				user: {
					connect: {
						id: user.id,
					},
				},
			},
		});
	}

	// Leave a room
	async leave(user: User, room: Room) {
		await this.prisma.member.delete({
			where: {
				room_id_user_id: {
					room_id: room.id,
					user_id: user.id,
				},
			},
		});
	}

	// Promote a member
	async promote(member: Member) {
		if (member.role === e_member_role.ADMIN) {
			throw new ConflictException('This member is already an administrator');
		}
		const updatedMember = await this.prisma.member.update({
			where: {
				room_id_user_id: {
					room_id: member.room_id,
					user_id: member.user_id,
				},
			},
			data: {
				role: 'ADMIN',
			},
		});
		return updatedMember;
	}

	// Demote a member
	async demote(member: Member) {
		if (member.role !== e_member_role.ADMIN) {
			throw new ConflictException('This member is not an administrator');
		}
		const updatedMember = await this.prisma.member.update({
			where: {
				room_id_user_id: {
					room_id: member.room_id,
					user_id: member.user_id,
				},
			},
			data: {
				role: 'MEMBER',
			},
		});
		return updatedMember;
	}

	// Kick a member
	async kick(member: Member) {
		await this.prisma.member.delete({
			where: {
				room_id_user_id: {
					room_id: member.room_id,
					user_id: member.user_id,
				},
			},
		});
	}

	// Mute member
	async mute(member: Member, dto: RoomMuteDto) {
		const muteUntil = new Date(dto.muted_until);
		const updatedMember = await this.prisma.member.update({
			where: {
				room_id_user_id: {
					room_id: member.room_id,
					user_id: member.user_id,
				},
			},
			data: {
				muted: true,
				muted_until: muteUntil,
			},
		});
		return updatedMember;
	}

	// Unmute member
	async unmute(member: Member) {
		if (!member.muted) {
			throw new ConflictException('This member is not muted');
		}
		const updatedMember = await this.prisma.member.update({
			where: {
				room_id_user_id: {
					room_id: member.room_id,
					user_id: member.user_id,
				},
			},
			data: {
				muted: false,
				muted_until: new Date(Date.now()),
			},
		});
		return updatedMember;
	}

	// Ban member
	async ban(member: Member) {
		if (member.banned) {
			throw new ConflictException('This member is already banned');
		}
		const bannedMember = await this.prisma.member.update({
			where: {
				room_id_user_id: {
					room_id: member.room_id,
					user_id: member.user_id,
				},
			},
			data: {
				banned: true,
			},
		});
		return bannedMember;
	}

	// Unban member
	async unban(member: Member) {
		if (!member.banned) {
			throw new ConflictException('This member is not banned');
		}
		const bannedMember = await this.prisma.member.update({
			where: {
				room_id_user_id: {
					room_id: member.room_id,
					user_id: member.user_id,
				},
			},
			data: {
				banned: false,
			},
		});
		return bannedMember;
	}
}
