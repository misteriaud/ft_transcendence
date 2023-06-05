import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RoomModule } from './room/room.module';
import { PongModule } from './game/pong.module';
import { StaticModule } from './static/static.module';
import { PresenceModule } from './presence/presence.module';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		JwtModule.register({
			global: true,
			secret: process.env.NESTJS_JWT_SECRET,
			signOptions: { expiresIn: '1d' },
		}),
		PrismaModule,
		AuthModule,
		UserModule,
		RoomModule,
		PongModule,
		StaticModule,
		PresenceModule,
	],
})
export class AppModule {}
