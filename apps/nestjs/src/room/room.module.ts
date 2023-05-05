import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { RoomGetService } from './guard/roomGet.service';
import { UserService } from 'src/user/user.service';
import { PrismaUserService } from 'src/user/prismaUser.service';

@Module({
	imports: [JwtModule.register({})],
	controllers: [RoomController],
	providers: [RoomService, RoomGetService, UserService, PrismaUserService],
})
export class RoomModule {}
