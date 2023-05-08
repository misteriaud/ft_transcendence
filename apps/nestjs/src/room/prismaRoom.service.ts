import { Injectable } from '@nestjs/common';
import { e_member_role, e_room_access } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PrismaRoomService {
	constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService) {}

	// ROOM

	// Create a room
	async create(user_id: number, name: string, access: e_room_access, hash: string | null) {
		return await this.prisma.room.create({
			data: {
				name: name,
				access: access,
				hash: hash,
				members: {
					create: {
						user: {
							connect: {
								id: user_id,
							},
						},
						role: e_member_role.OWNER,
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

	// Get PUBLIC and PROTECTED rooms
	async get(user_id: number) {
		return await this.prisma.room.findMany({
			where: {
				access: {
					in: ['PUBLIC', 'PROTECTED'],
				},
				members: {
					none: {
						user_id: user_id,
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
	async edit(room_id: number, name: string, access: e_room_access, hash: string | null) {
		return await this.prisma.room.update({
			where: {
				id: room_id,
			},
			data: {
				name: name,
				access: access,
				hash: hash,
			},
			select: {
				id: true,
				name: true,
				access: true,
			},
		});
	}

	// Delete a room
	async delete(room_id: number) {
		await this.prisma.room.delete({
			where: {
				id: room_id,
			},
		});
	}

	// MEMBER

	// Create a member
	async createMember(room_id: number, user_id: number) {
		return await this.prisma.member.create({
			data: {
				room: {
					connect: {
						id: room_id,
					},
				},
				user: {
					connect: {
						id: user_id,
					},
				},
			},
		});
	}

	// Get a member
	async getMember(room_id: number, user_id: number) {
		return await this.prisma.member.findUnique({
			where: {
				room_id_user_id: {
					room_id: room_id,
					user_id: user_id,
				},
			},
		});
	}

	// Edit a member
	async editMember(room_id: number, user_id: number, role: e_member_role | null, muted: boolean | null, muted_until: Date | null, banned: boolean | null) {
		return await this.prisma.member.update({
			where: {
				room_id_user_id: {
					room_id: room_id,
					user_id: user_id,
				},
			},
			data: {
				role: role,
				muted: muted,
				muted_until: muted_until,
				banned: banned,
			},
		});
	}

	// Delete a member
	async deleteMember(room_id: number, user_id: number) {
		await this.prisma.member.delete({
			where: {
				room_id_user_id: {
					room_id: room_id,
					user_id: user_id,
				},
			},
		});
	}
}
