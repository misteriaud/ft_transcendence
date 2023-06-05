import { Module } from '@nestjs/common';
import { PrismaRoomService } from 'src/room/prismaRoom.service';
import { PrismaUserService } from 'src/user/prismaUser.service';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { PresenceWebsocketGateway } from './presence.gateway';

@Module({
	imports: [UserModule],
	providers: [PresenceWebsocketGateway, UserService, PrismaUserService, PrismaRoomService],
})
export class PresenceModule {}
