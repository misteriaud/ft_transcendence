import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, UseGuards } from '@nestjs/common';
import { Member, e_room_access } from '@prisma/client';
import { JWTGuard } from 'src/auth/guard/JWT.guard';
import { GetUser } from 'src/auth/decorator';
import { InvitationDto, MessageDto, RoomDto, RoomJoinDto, RoomMuteDto } from './dto';
import { RoomService } from './room.service';
import { GetInvitation, GetMember, GetMessage, GetRoom } from './decorator';
import { GetInvitationGuard, GetMemberGuard, GetMessageGuard, GetRoomGuard, HierarchyGuard, MessageAuthorGuard, RoomAdminGuard, RoomAdminOrMessageAuthorGuard, RoomMemberGuard, RoomOwnerGuard } from './guard';
import { ApiTags } from '@nestjs/swagger';
import { i_blocked } from './interface/Blocked';

@ApiTags('rooms')
@UseGuards(JWTGuard)
@Controller('rooms')
export class RoomController {
	constructor(private roomService: RoomService) {}

	// ROOM

	/**
	 * Create a room
	 */
	@Post()
	create(@GetUser('id') user_id: number, @Body() dto: RoomDto) {
		return this.roomService.create(user_id, dto);
	}

	/**
	 * Get PUBLIC and PROTECTED rooms
	 */
	@Get()
	getPublicOrProtected(@GetUser('id') user_id: number) {
		return this.roomService.getPublicOrProtected(user_id);
	}

	/**
	 * Get a room
	 */
	@UseGuards(RoomMemberGuard, GetRoomGuard)
	@Get(':id')
	get(@GetRoom('id') room_id: number) {
		return this.roomService.get(room_id);
	}

	/**
	 * Edit a room
	 */
	@UseGuards(RoomOwnerGuard, GetRoomGuard)
	@Put(':id')
	edit(@GetRoom('id') room_id: number, @Body() dto: RoomDto) {
		return this.roomService.edit(room_id, dto);
	}

	/**
	 * Delete a room
	 */
	@UseGuards(RoomOwnerGuard, GetRoomGuard)
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(':id')
	delete(@GetRoom('id') room_id: number) {
		return this.roomService.delete(room_id);
	}

	/**
	 * Join a room
	 */
	@UseGuards(GetRoomGuard)
	@Post(':id/join')
	join(@GetUser('id') user_id: number, @GetRoom('id') room_id: number, @GetRoom('access') room_access: e_room_access, @GetRoom('hash') room_hash: string, @Body() dto: RoomJoinDto) {
		return this.roomService.join(user_id, room_id, room_access, room_hash, dto);
	}

	/**
	 * Join with invitation
	 */
	@UseGuards(GetRoomGuard, GetInvitationGuard)
	@Post(':id/join/:invitation_token')
	joinWithInvitation(@GetUser('id') user_id: number, @GetRoom('id') room_id: number, @GetRoom('access') room_access: e_room_access, @GetInvitation('token') invitation_token: string) {
		return this.roomService.joinWithInvitation(user_id, room_id, room_access, invitation_token);
	}

	/**
	 * Leave a room
	 */
	@UseGuards(RoomMemberGuard, GetRoomGuard)
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(':id/leave')
	leave(@GetUser('id') user_id: number, @GetRoom('id') room_id: number) {
		return this.roomService.leave(user_id, room_id);
	}

	// MEMBER

	/**
	 * Promote a member
	 */
	@UseGuards(RoomAdminGuard, HierarchyGuard, GetMemberGuard)
	@Put(':id/promote/:member_id')
	promote(@GetMember() member: Member) {
		return this.roomService.promote(member);
	}

	/**
	 * Demote a member
	 */
	@UseGuards(RoomAdminGuard, HierarchyGuard, GetMemberGuard)
	@Put(':id/demote/:member_id')
	demote(@GetMember() member: Member) {
		return this.roomService.demote(member);
	}

	/**
	 * Kick a member
	 */
	@UseGuards(RoomAdminGuard, HierarchyGuard, GetMemberGuard)
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(':id/kick/:member_id')
	kick(@GetMember() member: Member) {
		return this.roomService.kick(member);
	}

	/**
	 * Mute a member
	 */
	@UseGuards(RoomAdminGuard, HierarchyGuard, GetMemberGuard)
	@Put(':id/mute/:member_id')
	mute(@GetMember() member: Member, @Body() dto: RoomMuteDto) {
		return this.roomService.mute(member, dto);
	}

	/**
	 * Unmute a member
	 */
	@UseGuards(RoomAdminGuard, HierarchyGuard, GetMemberGuard)
	@Put(':id/unmute/:member_id')
	unmute(@GetMember() member: Member) {
		return this.roomService.unmute(member);
	}

	/**
	 * Ban a member
	 */
	@UseGuards(RoomAdminGuard, HierarchyGuard, GetMemberGuard)
	@Put(':id/ban/:member_id')
	ban(@GetMember() member: Member) {
		return this.roomService.ban(member);
	}

	/**
	 * Unban a member
	 */
	@UseGuards(RoomAdminGuard, HierarchyGuard, GetMemberGuard)
	@Put(':id/unban/:member_id')
	unban(@GetMember() member: Member) {
		return this.roomService.unban(member);
	}

	// MESSAGES

	// Create a message
	@UseGuards(RoomMemberGuard, GetRoomGuard)
	@Post(':id/message')
	createMessage(@GetUser('id') user_id: number, @GetRoom('id') room_id: number, @Body() dto: MessageDto) {
		return this.roomService.createMessage(user_id, room_id, dto);
	}

	// Get all messages
	@UseGuards(RoomMemberGuard, GetRoomGuard)
	@Get(':id/message')
	getAllMessages(@GetUser('blocked') blocked: i_blocked[], @GetRoom('id') room_id: number) {
		return this.roomService.getAllMessages(blocked, room_id);
	}

	// Edit a message
	@UseGuards(RoomMemberGuard, MessageAuthorGuard, GetMessageGuard)
	@Put(':id/message/:message_id')
	editMessage(@GetMessage('id') message_id: number, @Body() dto: MessageDto) {
		return this.roomService.editMessage(message_id, dto);
	}

	// Delete a message
	@UseGuards(RoomMemberGuard, RoomAdminOrMessageAuthorGuard, GetMessageGuard)
	@Delete(':id/message/:message_id')
	@HttpCode(HttpStatus.NO_CONTENT)
	deleteMessage(@GetMessage('id') message_id: number) {
		return this.roomService.deleteMessage(message_id);
	}

	// INVITATION

	/**
	 * Create an invitation
	 */
	@UseGuards(RoomAdminGuard, GetRoomGuard)
	@Post(':id/invitation')
	createInvitation(@GetUser('id') user_id: number, @GetRoom('id') room_id: number, @Body() dto: InvitationDto) {
		return this.roomService.createInvitation(user_id, room_id, dto);
	}

	/**
	 * Get all invitations
	 */
	@UseGuards(RoomAdminGuard, GetRoomGuard)
	@Get(':id/invitation')
	getAllInvitations(@GetRoom('id') room_id: number) {
		return this.roomService.getAllInvitations(room_id);
	}

	/**
	 * Delete an invitation
	 */
	@UseGuards(RoomAdminGuard, GetInvitationGuard)
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(':id/invitation/:invitation_token')
	deleteInvitation(@GetInvitation('token') invitation_token: string) {
		return this.roomService.deleteInvitation(invitation_token);
	}
}
