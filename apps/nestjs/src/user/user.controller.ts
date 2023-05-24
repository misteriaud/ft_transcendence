import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, UseGuards } from '@nestjs/common';
import { JWTGuard } from 'src/auth/guard/JWT.guard';
import { UserService } from './user.service';
import { GetUser } from 'src/auth/decorator';
import { BlockedGuard, GetOtherGuard, SelfGuard } from './guard';
import { GetOther } from './decorator';
import { UserDto } from './dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiUnauthorizedResponse, ApiOkResponse, ApiBadRequestResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiConflictResponse } from '@nestjs/swagger';
import { User } from 'src/_gen/prisma-class/user';

@ApiBearerAuth()
@ApiTags('users')
@UseGuards(JWTGuard)
@Controller('users')
export class UserController {
	constructor(private userService: UserService) {}

	/**
	 * Get your user information
	 */
	@ApiOkResponse({ type: User })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	@Get('me')
	getMe(@GetUser('id') user_id: number) {
		return this.userService.getMe(user_id);
	}

	/**
	 * Edit your user information (Does not work with images yet)
	 */
	@Put('me')
	editMe(@GetUser('id') user_id: number, @GetUser('twoFactorEnabled') twoFactorEnabled: boolean, @Body() dto: UserDto) {
		return this.userService.editMe(user_id, twoFactorEnabled, dto);
	}

	/**
	 * Delete your account
	 */
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete('me')
	deleteMe(@GetUser('id') user_id: number) {
		return this.userService.deleteMe(user_id);
	}

	/**
	 * Get user information
	 * @param other_id
	 */
	@ApiBadRequestResponse({ description: 'Invalid user id' })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	@ApiForbiddenResponse({ description: 'You have blocked this user | You have been blocked by this user' })
	@ApiNotFoundResponse({ description: 'User not found' })
	@UseGuards(BlockedGuard, GetOtherGuard)
	@Get(':id')
	get(@GetOther('id') other_id: number) {
		return this.userService.get(other_id);
	}

	/**
	 * Block user
	 */
	@ApiBadRequestResponse({ description: 'Invalid user id' })
	@ApiUnauthorizedResponse({ description: 'Unauthorized' })
	@ApiForbiddenResponse({ description: 'You cannot perform this action on yourself' })
	@ApiNotFoundResponse({ description: 'User not found' })
	@ApiConflictResponse({ description: 'This user is not blocked' })
	@UseGuards(SelfGuard, BlockedGuard, GetOtherGuard)
	@Post(':id/block')
	block(@GetUser('id') user_id: number, @GetOther('id') other_id: number) {
		return this.userService.block(user_id, other_id);
	}

	/**
	 * Unblock user
	 */
	@UseGuards(SelfGuard, BlockedGuard, GetOtherGuard)
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(':id/block')
	unblock(@GetUser('id') user_id: number, @GetOther('id') other_id: number) {
		return this.userService.unblock(user_id, other_id);
	}

	/**
	 * Send friend request
	 */
	@UseGuards(SelfGuard, BlockedGuard, GetOtherGuard)
	@Post(':id/friend/request')
	sendFriendRequest(@GetUser('id') user_id: number, @GetOther('id') other_id: number) {
		return this.userService.sendFriendRequest(user_id, other_id);
	}

	/**
	 * Cancel friend request
	 */
	@UseGuards(SelfGuard, BlockedGuard, GetOtherGuard)
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(':id/friend/request')
	cancelFriendRequest(@GetUser('id') user_id: number, @GetOther('id') other_id: number) {
		return this.userService.cancelFriendRequest(user_id, other_id);
	}

	/**
	 * Accept friend request
	 */
	@UseGuards(SelfGuard, BlockedGuard, GetOtherGuard)
	@Post(':id/friend/response')
	acceptFriendRequest(@GetUser('id') user_id: number, @GetOther('id') other_id: number) {
		return this.userService.acceptFriendRequest(user_id, other_id);
	}

	/**
	 * Reject friend request
	 */
	@UseGuards(SelfGuard, BlockedGuard, GetOtherGuard)
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(':id/friend/response')
	rejectFriendRequest(@GetUser('id') user_id: number, @GetOther('id') other_id: number) {
		return this.userService.rejectFriendRequest(user_id, other_id);
	}

	/**
	 * Delete friend
	 */
	@UseGuards(SelfGuard, BlockedGuard, GetOtherGuard)
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(':id/friend')
	deleteFriend(@GetUser('id') user_id: number, @GetOther('id') other_id: number) {
		return this.userService.deleteFriend(user_id, other_id);
	}
}
