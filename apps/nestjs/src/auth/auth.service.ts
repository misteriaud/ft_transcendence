import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
// import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
// import { MailService } from 'src/mail/mail.service';
// import * as speakeasy from 'speakeasy';

@Injectable()
export class AuthService {
	constructor(
		// private usersService: UserService,
		private jwtService: JwtService, // private mailService: MailService
	) {}

	async login(req: any) {
		if (!req.user) {
			throw new UnauthorizedException();
		}

		// console.log(process.env.SPEAKEASY_SECRET + req.user.username);
		// const token = speakeasy.totp({
		// 	secret: process.env.SPEAKEASY_SECRET + req.user.username,
		// 	time: Date.now() / 60,
		// });
		// await this.mailService.sendUserConfirmation(
		// 	'maxime.riaud@gmail.com',
		// 	token,
		// );
		const payload = { username: req.user.username };
		return {
			jwt: await this.jwtService.signAsync(payload),
			// totp: token,
		};
	}

	async validate2fa(jwt: string, totp: string) {
		let username = '';
		try {
			({ username } = this.jwtService.verify(jwt, {
				secret: process.env.NESTJS_JWT_SECRET,
			}));
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

	// async me(req: any) {
	// 	return await this.usersService.findOne(req.user.username);
	// }

	// async validateUser(json: any) {
	// 	return (user)
	// }
}
