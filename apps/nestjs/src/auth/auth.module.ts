import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
// import { PrismaModule } from 'src/prisma/prisma.module';
// import { ConfigService } from '@nestjs/config';
import { FortyTwoStrategy } from './42.strategy';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { PrismaUserService } from 'src/user/prismaUser.service';
// import { MailModule } from 'src/mail/mail.module';

@Module({
	imports: [
		UserModule,
		PassportModule,
		JwtModule.register({
			global: true,
			secret: process.env.NESTJS_JWT_SECRET,
			signOptions: { expiresIn: '1d' }, // e.g. 30s, 7d, 24h
		}),
	],
	providers: [AuthService, FortyTwoStrategy, UserService, PrismaUserService],
	controllers: [AuthController],
})
export class AuthModule {}
