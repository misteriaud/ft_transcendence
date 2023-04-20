import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { PrismaService } from './../prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
// import { MailService } from 'src/mail/mail.service';
import * as speakeasy from 'speakeasy';

@Injectable()
export class AuthService {
	constructor(
		private userService: UserService,
		private jwtService: JwtService, // private mailService: MailService
	) {}

	async login(req: any) {
		if (!req.user) {
			throw new UnauthorizedException();
		}

		const user = await this.userService.findOne(req.user.username);
		if (!user) console.log('user not found');

		if (user.twoFactorEnabled && user.twoFactorSecret) {
			// const token = speakeasy.totp({
			// 	secret: process.env.SPEAKEASY_SECRET + req.user.username,
			// 	time: Date.now() / 60,
			// });
		}

		// console.log(process.env.SPEAKEASY_SECRET + req.user.username);
		// await this.mailService.sendUserConfirmation(
		// 	'maxime.riaud@gmail.com',
		// 	token,
		// );
		// console.log(user);
		return {
			jwt: await this.jwtService.signAsync(user),
			// totp: token,
		};
	}

	async validate2fa(jwt: string, totp: string) {
		let username = '';
		try {
			({ username } = this.jwtService.verify(jwt));
		} catch (error) {
			throw new UnauthorizedException('invalid JWT');
		}
		// if (
		// 	// !speakeasy.totp.verify({
		// 	// 	secret: process.env.SPEAKEASY_SECRET + username,
		// 	// 	token: totp,
		// 	// 	time: Date.now() / 60,
		// 	// })
		// )
		// throw new UnauthorizedException('Invalid TOTP');
		return {
			access_token: await this.jwtService.signAsync({
				username: username,
			}),
		};
	}
}
