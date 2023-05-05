import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaUserService } from './prismaUser.service';
import { UserDto } from './dto';

@Injectable()
export class UserService {
	constructor(private prismaUser: PrismaUserService) {}

	// Get me
	async getMe(other: User) {
		return await this.prismaUser.getMe(other);
	}

	// Edit me
	async editMe(user: User, dto: UserDto) {
		return await this.prismaUser.editMe(user, dto);
	}

	// Delete me
	async deleteMe(user: User) {
		return await this.prismaUser.deleteMe(user);
	}

	// Get user
	async get(other: User) {
		return await this.prismaUser.get(other);
	}

	// Block user
	async block(user: User, other: User) {
		if (await this.prismaUser.getFriendRequest(user, other)) {
			await this.prismaUser.deleteFriendRequest(user, other);
		}
		if (await this.prismaUser.getFriendRequest(other, user)) {
			await this.prismaUser.deleteFriendRequest(other, user);
		}
		if (await this.prismaUser.getFriend(user, other)) {
			await this.prismaUser.deleteFriend(user, other);
			await this.prismaUser.deleteFriend(other, user);
		}
		return await this.prismaUser.createBlocked(user, other);
	}

	// Unblock user
	async unblock(user: User, other: User) {
		await this.prismaUser.deleteBlocked(user, other);
	}

	// Send friend request
	async sendFriendRequest(user: User, other: User) {
		if (await this.prismaUser.getFriend(user, other)) {
			throw new ConflictException('You are already friends with this user');
		}
		if (await this.prismaUser.getFriendRequest(user, other)) {
			throw new ConflictException('You have already sent a friend request to this user');
		}
		if (await this.prismaUser.getFriendRequest(other, user)) {
			await this.prismaUser.deleteFriendRequest(other, user);
			await this.prismaUser.createFriend(other, user);
			return await this.prismaUser.createFriend(user, other);
		}
		return await this.prismaUser.createFriendRequest(user, other);
	}

	// Cancel friend request
	async cancelFriendRequest(user: User, other: User) {
		if (!(await this.prismaUser.getFriendRequest(user, other))) {
			throw new NotFoundException('Friend request not found');
		}
		await this.prismaUser.deleteFriendRequest(user, other);
	}

	// Accept friend request
	async acceptFriendRequest(user: User, other: User) {
		if (!(await this.prismaUser.getFriendRequest(other, user))) {
			throw new NotFoundException('Friend request not found');
		}
		await this.prismaUser.deleteFriendRequest(other, user);
		await this.prismaUser.createFriend(other, user);
		return await this.prismaUser.createFriend(user, other);
	}

	// Reject friend request
	async rejectFriendRequest(user: User, other: User) {
		if (!(await this.prismaUser.getFriendRequest(other, user))) {
			throw new NotFoundException('Friend request not found');
		}
		await this.prismaUser.deleteFriendRequest(other, user);
	}

	// Delete friend
	async deleteFriend(user: User, other: User) {
		if (!(await this.prismaUser.getFriend(user, other))) {
			throw new NotFoundException('Friend not found');
		}
		await this.prismaUser.deleteFriend(user, other);
		await this.prismaUser.deleteFriend(other, user);
	}
}
