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
	async getPublicOrProtected(user_id: number) {
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

	// Get a room
	async get(room_id: number) {
		return await this.prisma.room.findUnique({
			where: {
				id: room_id,
			},
			select: {
				id: true,
				name: true,
				access: true,
				members: {
					where: {
						banned: false,
					},
					select: {
						user: {
							select: {
								id: true,
								username: true,
								login42: true,
								avatar: true,
							},
						},
						muted: true,
						muted_until: true,
						messages: {
							select: {
								id: true,
								content: true,
								createdAt: true,
								updatedAt: true,
							},
						},
						invitations: {
							select: {
								id: true,
								token: true,
							},
						},
					},
				},
			},
		});
	}

	// Get all members of room
	async getRoomMembers(room_id: number) {
		return await this.prisma.room.findUnique({
			where: {
				id: room_id,
			},
			select: {
				members: {
					where: {
						banned: false,
					},
					select: {
						user: {
							select: {
								id: true,
							},
						},
					},
				},
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

	// MESSAGE

	// Create a message
	async createMessage(room_id: number, user_id: number, content: string) {
		return await this.prisma.message.create({
			data: {
				author: {
					connect: {
						room_id_user_id: {
							room_id: room_id,
							user_id: user_id,
						},
					},
				},
				content: content,
			},
			select: {
				id: true,
				author: {
					select: {
						user: {
							select: {
								id: true,
								username: true,
								login42: true,
								avatar: true,
							},
						},
					},
				},
				content: true,
				createdAt: true,
				updatedAt: true,
			},
		});
	}

	// Get all messages
	async getAllMessages(room_id: number) {
		return await this.prisma.message.findMany({
			where: {
				room_id: room_id,
			},
			select: {
				id: true,
				author: {
					select: {
						user: {
							select: {
								id: true,
								username: true,
								login42: true,
								avatar: true,
							},
						},
					},
				},
				content: true,
				createdAt: true,
				updatedAt: true,
			},
		});
	}

	// Get a message
	async getMessage(message_id: number) {
		return await this.prisma.message.findUnique({
			where: {
				id: message_id,
			},
			select: {
				id: true,
				author: {
					select: {
						user: {
							select: {
								id: true,
								username: true,
								login42: true,
								avatar: true,
							},
						},
					},
				},
				content: true,
				createdAt: true,
				updatedAt: true,
			},
		});
	}

	// Edit a message
	async editMessage(message_id: number, content: string) {
		return await this.prisma.message.update({
			where: {
				id: message_id,
			},
			data: {
				content: content,
			},
			select: {
				id: true,
				author: {
					select: {
						user: {
							select: {
								id: true,
								username: true,
								login42: true,
								avatar: true,
							},
						},
					},
				},
				content: true,
				createdAt: true,
				updatedAt: true,
			},
		});
	}

	// Delete a message
	async deleteMessage(message_id: number) {
		return await this.prisma.message.delete({
			where: {
				id: message_id,
			},
		});
	}

	// INVITATION

	// Create an invitation
	async createInvitation(room_id: number, user_id: number, token: string) {
		return await this.prisma.invitation.create({
			data: {
				iss: {
					connect: {
						room_id_user_id: {
							room_id: room_id,
							user_id: user_id,
						},
					},
				},
				token: token,
			},
			select: {
				id: true,
				iss: {
					select: {
						user: {
							select: {
								id: true,
								username: true,
								login42: true,
								avatar: true,
							},
						},
					},
				},
				token: true,
			},
		});
	}

	// Get all invitations
	async getAllInvitations(room_id: number) {
		return await this.prisma.invitation.findMany({
			where: {
				room_id: room_id,
			},
			select: {
				id: true,
				iss: {
					select: {
						user: {
							select: {
								id: true,
								username: true,
								login42: true,
								avatar: true,
							},
						},
					},
				},
				token: true,
			},
		});
	}

	// Get an invitation
	async getInvitation(token: string) {
		return await this.prisma.invitation.findUnique({
			where: {
				token: token,
			},
		});
	}

	// Delete an invitation
	async deleteInvitation(token: string) {
		await this.prisma.invitation.delete({
			where: {
				token: token,
			},
		});
	}
}
