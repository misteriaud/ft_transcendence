import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Put, UseGuards } from '@nestjs/common';
import { Member, e_room_access } from '@prisma/client';
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
	create(@GetUser('id') user_id: number, @Body() dto: RoomDto) {
		return this.roomService.create(user_id, dto);
	}

	// Get PUBLIC and PROTECTED rooms
	@Get()
	getPublicOrProtected(@GetUser('id') user_id: number) {
		return this.roomService.getPublicOrProtected(user_id);
	}

	// Get a room
	@UseGuards(RoomMemberGuard, GetRoomGuard)
	@Get(':id')
	get(@GetRoom('id') room_id: number) {
		return this.roomService.get(room_id);
	}

	// Edit a room
	@UseGuards(RoomOwnerGuard, GetRoomGuard)
	@Put(':id')
	edit(@GetRoom('id') room_id: number, @Body() dto: RoomDto) {
		return this.roomService.edit(room_id, dto);
	}

	// Delete a room
	@UseGuards(RoomOwnerGuard, GetRoomGuard)
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(':id')
	delete(@GetRoom('id') room_id: number) {
		return this.roomService.delete(room_id);
	}

	// Join a room
	@UseGuards(GetRoomGuard)
	@Post(':id/join')
	join(@GetUser('id') user_id: number, @GetRoom('id') room_id: number, @GetRoom('access') room_access: e_room_access, @GetRoom('hash') room_hash: string, @Body() dto: RoomJoinDto) {
		return this.roomService.join(user_id, room_id, room_access, room_hash, dto);
	}

	// Generate invitation
	@UseGuards(RoomMemberGuard, GetRoomGuard)
	@HttpCode(HttpStatus.OK)
	@Post(':id/generate-invitation')
	generateInvitation(@GetUser('id') user_id: number, @GetRoom('id') room_id: number, @Body() dto: RoomInviteDto) {
		return this.roomService.generateInvitation(user_id, room_id, dto);
	}

	// Join with invitation
	@UseGuards(GetRoomGuard, GetInvitationTokenGuard)
	@Post(':id/join/:invitationToken')
	joinWithInvitation(@GetUser('id') user_id: number, @GetRoom('id') room_id: number, @GetRoom('access') room_access: e_room_access, @GetInvitationToken() invitationToken: string) {
		return this.roomService.joinWithInvitation(user_id, room_id, room_access, invitationToken);
	}

	// Leave a room
	@UseGuards(RoomMemberGuard, GetRoomGuard)
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete(':id/leave')
	leave(@GetUser('id') user_id: number, @GetRoom('id') room_id: number) {
		return this.roomService.leave(user_id, room_id);
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
