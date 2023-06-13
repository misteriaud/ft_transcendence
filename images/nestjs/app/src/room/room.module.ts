import { Module } from '@nestjs/common';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { PrismaRoomService } from './prismaRoom.service';
import { RoomGetService } from './guard/roomGet.service';
import { MessageAuthorGuard, RoomAdminGuard } from './guard';
import { UserService } from 'src/user/user.service';
import { PrismaUserService } from 'src/user/prismaUser.service';
import { ChatWebsocketGateway } from './chat.gateway';

@Module({
	controllers: [RoomController],
	providers: [RoomService, PrismaRoomService, RoomGetService, RoomAdminGuard, MessageAuthorGuard, UserService, PrismaUserService, ChatWebsocketGateway],
})
export class RoomModule {}
