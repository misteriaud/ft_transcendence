import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDto } from './dto';

@Injectable()
export class PrismaUserService {
	constructor(private prisma: PrismaService) {}

	// Get me
	async getMe(user_id: number, includeSecret: boolean) {
		return await this.prisma.user.findUnique({
			where: {
				id: user_id,
			},
			select: {
				id: true,
				username: true,
				login42: true,
				avatar: true,
				status: true,
				twoFactorEnabled: true,
				twoFactorSecret: includeSecret,
				friends: {
					select: {
						userB: {
							select: {
								id: true,
								username: true,
								login42: true,
								avatar: true,
								status: true,
							},
						},
					},
				},
				blocked: {
					select: {
						userB: {
							select: {
								id: true,
								username: true,
								login42: true,
								avatar: true,
							},
						},
					},
				},
				blockedBy: {
					select: {
						userA: {
							select: {
								id: true,
								username: true,
								login42: true,
								avatar: true,
							},
						},
					},
				},
				friendRequestsSent: {
					select: {
						userB: {
							select: {
								id: true,
								username: true,
								login42: true,
								avatar: true,
								status: true,
							},
						},
					},
				},
				friendRequestsReceived: {
					select: {
						userB: {
							select: {
								id: true,
								username: true,
								login42: true,
								avatar: true,
								status: true,
							},
						},
					},
				},
				wins: true,
				losses: true,
				history: true,
				memberOf: {
					where: {
						banned: false,
					},
					select: {
						room: {
							select: {
								id: true,
								name: true,
								access: true,
							},
						},
					},
				},
				createdAt: true,
				updatedAt: true,
			},
		});
	}

	// Edit me
	async editMe(user: User, dto: UserDto) {
		return await this.prisma.user.update({
			where: {
				id: user.id,
			},
			data: {
				username: dto.username,
				twoFactorEnabled: dto.twoFactorEnabled,
			},
			select: {
				id: true,
				username: true,
				avatar: true,
				twoFactorEnabled: true,
			},
		});
	}

	// Delete me
	async deleteMe(user: User) {
		await this.prisma.user.delete({
			where: {
				id: user.id,
			},
		});
	}

	// Get
	async get(user: User) {
		return await this.prisma.user.findUnique({
			where: {
				id: user.id,
			},
			select: {
				id: true,
				username: true,
				login42: true,
				avatar: true,
				status: true,
				wins: true,
				losses: true,
				history: true,
				createdAt: true,
			},
		});
	}

	// Create blocked
	async createBlocked(userA: User, userB: User) {
		return await this.prisma.blocked.create({
			data: {
				userA: {
					connect: {
						id: userA.id,
					},
				},
				userB: {
					connect: {
						id: userB.id,
					},
				},
			},
		});
	}

	// Delete blocked
	async deleteBlocked(userA: User, userB: User) {
		await this.prisma.blocked.delete({
			where: {
				userA_id_userB_id: {
					userA_id: userA.id,
					userB_id: userB.id,
				},
			},
		});
	}

	// Create friend request
	async createFriendRequest(userA: User, userB: User) {
		return await this.prisma.friendRequests.create({
			data: {
				userA: {
					connect: {
						id: userA.id,
					},
				},
				userB: {
					connect: {
						id: userB.id,
					},
				},
			},
		});
	}

	// Get friend request
	async getFriendRequest(userA: User, userB: User) {
		return await this.prisma.friendRequests.findUnique({
			where: {
				userA_id_userB_id: {
					userA_id: userA.id,
					userB_id: userB.id,
				},
			},
		});
	}

	// Delete friend request
	async deleteFriendRequest(userA: User, userB: User) {
		await this.prisma.friendRequests.delete({
			where: {
				userA_id_userB_id: {
					userA_id: userA.id,
					userB_id: userB.id,
				},
			},
		});
	}

	// Create friend
	async createFriend(userA: User, userB: User) {
		return await this.prisma.friends.create({
			data: {
				userA: {
					connect: {
						id: userA.id,
					},
				},
				userB: {
					connect: {
						id: userB.id,
					},
				},
			},
		});
	}

	// Get friend
	async getFriend(userA: User, userB: User) {
		return await this.prisma.friends.findUnique({
			where: {
				userA_id_userB_id: {
					userA_id: userA.id,
					userB_id: userB.id,
				},
			},
		});
	}

	// Delete friend
	async deleteFriend(userA: User, userB: User) {
		await this.prisma.friends.delete({
			where: {
				userA_id_userB_id: {
					userA_id: userA.id,
					userB_id: userB.id,
				},
			},
		});
	}

	// Auth - Get me by login42
	async getMeByLogin42(login42: string) {
		return await this.prisma.user.findUnique({
			where: {
				login42: login42,
			},
		});
	}

	// Auth - Set 2fa secret
	async set2faSecret(secret: string, user_id: number) {
		return await this.prisma.user.update({
			where: {
				id: user_id,
			},
			data: {
				twoFactorEnabled: true,
				twoFactorSecret: secret,
			}
		});
	}
}
