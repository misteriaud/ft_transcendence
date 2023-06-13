import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaUserService } from './prismaUser.service';
import { UserGetService } from './guard/userGet.service';
import { PrismaRoomService } from 'src/room/prismaRoom.service';

@Module({
	controllers: [UserController],
	providers: [UserService, PrismaUserService, UserGetService, PrismaRoomService],
})
export class UserModule {}
