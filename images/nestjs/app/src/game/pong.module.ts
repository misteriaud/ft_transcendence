import { Module } from '@nestjs/common';
import { PongWebsocketGateway } from './pong.gateway';
import { UserModule } from '../user/user.module';
import { UserService } from 'src/user/user.service';
import { PrismaUserService } from 'src/user/prismaUser.service';
//import { PrismaRoomService } from 'src/room/prismaRoom.service';
import { PrismaMatchService } from './prismaMatch.service';
import { PrismaRoomService } from 'src/room/prismaRoom.service';
import { GameController } from './game.controller';

@Module({
	controllers: [GameController],
	imports: [UserModule],
	providers: [PongWebsocketGateway, UserService, PrismaUserService, PrismaRoomService, PrismaMatchService],
})
export class PongModule {}
