import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { RoomModule } from './room/room.module';

@Module({
	imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, UserModule, PrismaModule, RoomModule],
})
export class AppModule {}
