import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RoomModule } from './room/room.module';

@Module({
	imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AuthModule, UserModule, RoomModule],
})
export class AppModule {}
