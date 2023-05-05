import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { JWTGuard } from 'src/auth/JWT.guard';
import { UserService } from './user.service';
import { GetUser } from 'src/auth/decorator';
import { BlockedGuard, GetOtherGuard, SelfGuard } from './guard';
import { GetOther } from './decorator';
import { UserDto } from './dto';

@UseGuards(JWTGuard)
@Controller('users')
export class UserController {
	constructor(private userService: UserService) {}

	// Get me
	@Get('me')
	getMe(@GetUser('id') user_id: number) {
		return this.userService.getMe(user_id);
	}

	// Edit me
	@Put('me')
	editMe(@GetUser() user: User, @Body() dto: UserDto) {
		return this.userService.editMe(user, dto);
	}

	// Delete me
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete('me')
	deleteMe(@GetUser() user: User) {
		return this.userService.deleteMe(user);
	}

	// Get user
	@UseGuards(BlockedGuard, GetOtherGuard)
	@Get(':id')
	get(@GetOther() other: User) {
		return this.userService.get(other);
	}

	// Block user
	@UseGuards(SelfGuard, BlockedGuard, GetOtherGuard)
	@Post(':id/block')
	block(@GetUser() user: User, @GetOther() other: User) {
		return this.userService.block(user, other);
	}

	// Unblock user
	@UseGuards(SelfGuard, BlockedGuard, GetOtherGuard)
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(':id/block')
	unblock(@GetUser() user: User, @GetOther() other: User) {
		return this.userService.unblock(user, other);
	}

	// Send friend request
	@UseGuards(SelfGuard, BlockedGuard, GetOtherGuard)
	@Post(':id/friend/request')
	sendFriendRequest(@GetUser() user: User, @GetOther() other: User) {
		return this.userService.sendFriendRequest(user, other);
	}

	// Cancel friend request
	@UseGuards(SelfGuard, BlockedGuard, GetOtherGuard)
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(':id/friend/request')
	cancelFriendRequest(@GetUser() user: User, @GetOther() other: User) {
		return this.userService.cancelFriendRequest(user, other);
	}

	// Accept friend request
	@UseGuards(SelfGuard, BlockedGuard, GetOtherGuard)
	@Post(':id/friend/response')
	acceptFriendRequest(@GetUser() user: User, @GetOther() other: User) {
		return this.userService.acceptFriendRequest(user, other);
	}

	// Reject friend request
	@UseGuards(SelfGuard, BlockedGuard, GetOtherGuard)
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(':id/friend/response')
	rejectFriendRequest(@GetUser() user: User, @GetOther() other: User) {
		return this.userService.rejectFriendRequest(user, other);
	}

	// Delete friend
	@UseGuards(SelfGuard, BlockedGuard, GetOtherGuard)
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(':id/friend')
	deleteFriend(@GetUser() user: User, @GetOther() other: User) {
		return this.userService.deleteFriend(user, other);
	}
}
