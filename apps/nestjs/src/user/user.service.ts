import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaUserService } from './prismaUser.service';
import { UserDto } from './dto';
import { Profile } from 'passport';
import { join } from 'path';

@Injectable()
export class UserService {
	constructor(private config: ConfigService, private jwt: JwtService, private prismaUser: PrismaUserService) {}

	// USER

	// Get me
	async getMe(user_id: number, includeSecret = false) {
		return await this.prismaUser.getMe(user_id, includeSecret);
	}

	// Edit me
	async editMe(user_id: number, twoFactorEnabled: boolean, dto: UserDto, file?: Express.Multer.File) {
		let new_avatarURL: string | null;
		let new_twoFactorEnabled: boolean | null;

		if (!dto.username) {
			dto.username = null;
		}
		if (!file) {
			new_avatarURL = null;
		} else {
			new_avatarURL = `http://localhost:${this.config.get('PORT')}` + join(`/static/uploads/avatar`, file.filename);
		}
		if (!dto.twoFactorEnabled) {
			dto.twoFactorEnabled = null;
			new_twoFactorEnabled = null;
		} else {
			new_twoFactorEnabled = dto.twoFactorEnabled === 'false' ? false : true;
		}
		console.log(new_twoFactorEnabled);

		return {
			me: await this.prismaUser.editMe(user_id, twoFactorEnabled, new_twoFactorEnabled, dto, new_avatarURL),
			jwt: await this.jwt.signAsync({
				id: user_id,
				twoFactorEnabled: new_twoFactorEnabled !== null ? new_twoFactorEnabled : twoFactorEnabled,
				authorized2fa: new_twoFactorEnabled !== null ? new_twoFactorEnabled : twoFactorEnabled,
			}),
		};
	}

	// Delete me
	async deleteMe(user_id: number) {
		await this.prismaUser.deleteMe(user_id);
	}

	// Get user
	async get(other_id: number) {
		return await this.prismaUser.get(other_id);
	}

	// SOCIAL

	// Block user
	async block(user_id: number, other_id: number) {
		if (await this.prismaUser.getFriendRequest(user_id, other_id)) {
			await this.prismaUser.deleteFriendRequest(user_id, other_id);
		}
		if (await this.prismaUser.getFriendRequest(other_id, user_id)) {
			await this.prismaUser.deleteFriendRequest(other_id, user_id);
		}
		if (await this.prismaUser.getFriend(user_id, other_id)) {
			await this.prismaUser.deleteFriend(user_id, other_id);
			await this.prismaUser.deleteFriend(other_id, user_id);
		}
		return await this.prismaUser.createBlocked(user_id, other_id);
	}

	// Unblock user
	async unblock(user_id: number, other_id: number) {
		await this.prismaUser.deleteBlocked(user_id, other_id);
	}

	// Send friend request
	async sendFriendRequest(user_id: number, other_id: number) {
		if (await this.prismaUser.getFriend(user_id, other_id)) {
			throw new ConflictException('You are already friends with this user');
		}
		if (await this.prismaUser.getFriendRequest(user_id, other_id)) {
			throw new ConflictException('You have already sent a friend request to this user');
		}
		if (await this.prismaUser.getFriendRequest(other_id, user_id)) {
			await this.prismaUser.deleteFriendRequest(other_id, user_id);
			await this.prismaUser.createFriend(other_id, user_id);
			return await this.prismaUser.createFriend(user_id, other_id);
		}
		return await this.prismaUser.createFriendRequest(user_id, other_id);
	}

	// Cancel friend request
	async cancelFriendRequest(user_id: number, other_id: number) {
		if (!(await this.prismaUser.getFriendRequest(user_id, other_id))) {
			throw new NotFoundException('Friend request not found');
		}
		await this.prismaUser.deleteFriendRequest(user_id, other_id);
	}

	// Accept friend request
	async acceptFriendRequest(user_id: number, other_id: number) {
		if (!(await this.prismaUser.getFriendRequest(other_id, user_id))) {
			throw new NotFoundException('Friend request not found');
		}
		await this.prismaUser.deleteFriendRequest(other_id, user_id);
		await this.prismaUser.createFriend(other_id, user_id);
		return await this.prismaUser.createFriend(user_id, other_id);
	}

	// Reject friend request
	async rejectFriendRequest(user_id: number, other_id: number) {
		if (!(await this.prismaUser.getFriendRequest(other_id, user_id))) {
			throw new NotFoundException('Friend request not found');
		}
		await this.prismaUser.deleteFriendRequest(other_id, user_id);
	}

	// Delete friend
	async deleteFriend(user_id: number, other_id: number) {
		if (!(await this.prismaUser.getFriend(user_id, other_id))) {
			throw new NotFoundException('Friend not found');
		}
		await this.prismaUser.deleteFriend(user_id, other_id);
		await this.prismaUser.deleteFriend(other_id, user_id);
	}

	// AUTH

	// Auth - Get me by login42
	async createFromOAuth2(profile: Profile) {
		return await this.prismaUser.createFromOAuth2(profile);
	}

	// Auth - Get me by login42
	async getMeByLogin42(login42: string) {
		return await this.prismaUser.getMeByLogin42(login42);
	}

	// Auth - Set 2fa secret
	async set2faSecret(secret: string, user_id: number) {
		return await this.prismaUser.set2faSecret(secret, user_id);
	}
}
