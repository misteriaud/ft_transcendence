import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDto } from './dto';
import { Profile } from 'passport';
import { authenticator } from 'otplib';

@Injectable()
export class PrismaUserService {
	constructor(private config: ConfigService, private prisma: PrismaService) {}

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
						role: true,
					},
				},
				createdAt: true,
				updatedAt: true,
			},
		});
	}

	// Edit me
	async editMe(user_id: number, twoFactorEnabled: boolean, new_twoFactorEnabled: boolean, dto: UserDto, avatarURL: string | null) {
		let secret: string | null = null;

		if (!twoFactorEnabled && new_twoFactorEnabled) {
			secret = authenticator.generateSecret();
		}

		const data: {
			username?: string;
			avatar?: string;
			twoFactorEnabled?: boolean;
			twoFactorSecret?: string;
		} = {
			...(dto.username !== null && { username: dto.username }),
			...(avatarURL !== null && { avatar: avatarURL }),
			...(dto.twoFactorEnabled !== null && { twoFactorEnabled: new_twoFactorEnabled }),
			...(secret !== null && { twoFactorSecret: secret }),
		};

		return await this.prisma.user.update({
			where: {
				id: user_id,
			},
			data: data,
			select: {
				id: true,
				username: true,
				avatar: true,
				twoFactorEnabled: true,
				twoFactorSecret: !!secret,
			},
		});
	}

	// Delete me
	async deleteMe(user_id: number) {
		await this.prisma.user.delete({
			where: {
				id: user_id,
			},
		});
	}

	// Get all users
	async getAll() {
		return await this.prisma.user.findMany({
			select: {
				id: true,
				username: true,
				login42: true,
				avatar: true,
				status: true,
			},
		});
	}

	// Get
	async get(user_id: number) {
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
				history: true,
				createdAt: true,
			},
		});
	}

	// Create friend request
	async createFriendRequest(userA_id: number, userB_id: number) {
		return await this.prisma.friendRequests.create({
			data: {
				userA: {
					connect: {
						id: userA_id,
					},
				},
				userB: {
					connect: {
						id: userB_id,
					},
				},
			},
		});
	}

	// Get friend request
	async getFriendRequest(userA_id: number, userB_id: number) {
		return await this.prisma.friendRequests.findUnique({
			where: {
				userA_id_userB_id: {
					userA_id: userA_id,
					userB_id: userB_id,
				},
			},
		});
	}

	// Delete friend request
	async deleteFriendRequest(userA_id: number, userB_id: number) {
		await this.prisma.friendRequests.delete({
			where: {
				userA_id_userB_id: {
					userA_id: userA_id,
					userB_id: userB_id,
				},
			},
		});
	}

	// Create friend
	async createFriend(userA_id: number, userB_id: number) {
		return await this.prisma.friends.create({
			data: {
				userA: {
					connect: {
						id: userA_id,
					},
				},
				userB: {
					connect: {
						id: userB_id,
					},
				},
			},
		});
	}

	// Get friend
	async getFriend(userA_id: number, userB_id: number) {
		return await this.prisma.friends.findUnique({
			where: {
				userA_id_userB_id: {
					userA_id: userA_id,
					userB_id: userB_id,
				},
			},
		});
	}

	// Delete friend
	async deleteFriend(userA_id: number, userB_id: number) {
		await this.prisma.friends.delete({
			where: {
				userA_id_userB_id: {
					userA_id: userA_id,
					userB_id: userB_id,
				},
			},
		});
	}

	// Create blocked
	async createBlocked(userA_id: number, userB_id: number) {
		return await this.prisma.blocked.create({
			data: {
				userA: {
					connect: {
						id: userA_id,
					},
				},
				userB: {
					connect: {
						id: userB_id,
					},
				},
			},
		});
	}

	// Delete blocked
	async deleteBlocked(userA_id: number, userB_id: number) {
		await this.prisma.blocked.delete({
			where: {
				userA_id_userB_id: {
					userA_id: userA_id,
					userB_id: userB_id,
				},
			},
		});
	}

	// AUTH PART

	// Create a user
	async createFromOAuth2(profile: Profile) {
		const room = await this.prisma.user.create({
			data: {
				username: profile.displayName,
				login42: profile.username,
				avatar: `http://localhost:${this.config.get('PORT')}/static/uploads/avatar/default.jpg`,
			},
			// select: {
			// 	id: true,
			// 	twoFactorEnabled: true,
			// },
		});
		return room;
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
			},
		});
	}
}
