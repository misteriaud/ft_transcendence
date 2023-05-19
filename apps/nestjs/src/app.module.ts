import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RoomModule } from './room/room.module';
import { WebsocketModule } from './websocket/websocket.module';
import { PongModule } from './game/pong.module';

@Module({
	imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AuthModule, UserModule, RoomModule, WebsocketModule],
})
export class AppModule {}
