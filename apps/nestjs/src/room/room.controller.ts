import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, UseGuards } from '@nestjs/common';
import { Member, Room, User } from '@prisma/client';
import { JWTGuard } from 'src/auth/JWT.guard';
import { GetUser } from 'src/auth/decorator';
import { RoomDto, RoomInviteDto, RoomJoinDto, RoomMuteDto } from './dto';
import { RoomService } from './room.service';
import { GetInvitationToken, GetMember, GetRoom } from './decorator';
import { GetInvitationTokenGuard, GetMemberGuard, GetRoomGuard, HierarchyGuard, RoomAdminGuard, RoomMemberGuard, RoomOwnerGuard } from './guard';

@UseGuards(JWTGuard)
@Controller('rooms')
export class RoomController {
	constructor(private roomService: RoomService) {}

	// Create a room
	@Post()
	create(@GetUser() user: User, @Body() dto: RoomDto) {
		return this.roomService.create(user, dto);
	}

	// Get PUBLIC and PROTECTED rooms
	@Get()
	get(@GetUser() user: User) {
		return this.roomService.get(user);
	}

	// Edit a room
	@UseGuards(RoomOwnerGuard, GetRoomGuard)
	@Put(':id')
	edit(@GetRoom() room: Room, @Body() dto: RoomDto) {
		return this.roomService.edit(room, dto);
	}

	// Delete a room
	@UseGuards(RoomOwnerGuard, GetRoomGuard)
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(':id')
	delete(@GetRoom() room: Room) {
		return this.roomService.delete(room);
	}

	// Join a room
	@UseGuards(GetRoomGuard)
	@Post(':id/join')
	join(@GetUser() user: User, @GetRoom() room: Room, @Body() dto: RoomJoinDto) {
		return this.roomService.join(user, room, dto);
	}

	// Generate invitation
	@UseGuards(RoomMemberGuard, GetRoomGuard)
	@HttpCode(HttpStatus.OK)
	@Post(':id/generate-invitation')
	generateInvitation(@GetUser() user: User, @GetRoom() room: Room, @Body() dto: RoomInviteDto) {
		return this.roomService.generateInvitation(user, room, dto);
	}

	// Join with invitation
	@UseGuards(GetRoomGuard, GetInvitationTokenGuard)
	@Post(':id/join/:invitationToken')
	joinWithInvitation(@GetUser() user: User, @GetRoom() room: Room, @GetInvitationToken() invitationToken: string) {
		return this.roomService.joinWithInvitation(user, room, invitationToken);
	}

	// Leave a room
	@UseGuards(RoomMemberGuard, GetRoomGuard)
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(':id/leave')
	leave(@GetUser() user: User, @GetRoom() room: Room) {
		return this.roomService.leave(user, room);
	}

	// Promote a member
	@UseGuards(RoomOwnerGuard, HierarchyGuard, GetMemberGuard)
	@Put(':id/promote/:member_id')
	promote(@GetMember() member: Member) {
		return this.roomService.promote(member);
	}

	// Demote a member
	@UseGuards(RoomOwnerGuard, HierarchyGuard, GetMemberGuard)
	@Put(':id/demote/:member_id')
	demote(@GetMember() member: Member) {
		return this.roomService.demote(member);
	}

	// Kick a member
	@UseGuards(RoomAdminGuard, HierarchyGuard, GetMemberGuard)
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(':id/kick/:member_id')
	kick(@GetMember() member: Member) {
		return this.roomService.kick(member);
	}

	// Mute a member
	@UseGuards(RoomAdminGuard, HierarchyGuard, GetMemberGuard)
	@Put(':id/mute/:member_id')
	mute(@GetMember() member: Member, @Body() dto: RoomMuteDto) {
		return this.roomService.mute(member, dto);
	}

	// Unmute a member
	@UseGuards(RoomAdminGuard, HierarchyGuard, GetMemberGuard)
	@Put(':id/unmute/:member_id')
	unmute(@GetMember() member: Member) {
		return this.roomService.unmute(member);
	}

	// Ban a member
	@UseGuards(RoomAdminGuard, HierarchyGuard, GetMemberGuard)
	@Put(':id/ban/:member_id')
	ban(@GetMember() member: Member) {
		return this.roomService.ban(member);
	}

	// Unban a member
	@UseGuards(RoomAdminGuard, HierarchyGuard, GetMemberGuard)
	@Put(':id/unban/:member_id')
	unban(@GetMember() member: Member) {
		return this.roomService.unban(member);
	}
}
