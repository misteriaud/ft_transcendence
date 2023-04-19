import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigService } from '@nestjs/config';
import { FortyTwoStrategy } from './42.strategy';
import { UserModule } from 'src/user/user.module';
// import { MailModule } from 'src/mail/mail.module';

@Module({
	imports: [
		PrismaModule,
		PassportModule,
		UserModule,
		JwtModule.register({
			secret: process.env.NESTJS_JWT_SECRET,
			signOptions: { expiresIn: '5m' }, // e.g. 30s, 7d, 24h
		}),
		// MailModule,
	],
	providers: [AuthService, FortyTwoStrategy],
	controllers: [AuthController],
})
export class AuthModule {}
