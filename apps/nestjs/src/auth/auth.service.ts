import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { i_JWTPayload } from './interface/jwt';
import { authenticator } from 'otplib';
import { Profile } from 'passport';
import { GetOAuthUser } from './decorator';

@Injectable()
export class AuthService {
	constructor(
		private userService: UserService,
		private jwtService: JwtService, // private mailService: MailService
	) {}

	async signJWT(payload: i_JWTPayload) {
		return await this.jwtService.signAsync({ ...payload });
	}

	async login(profile: Profile) {
		let user = await this.userService.getMeByLogin42(profile.username);

		if (!user) {
			user = await this.userService.createFromOAuth2(profile);
		}

		const jwt = await this.signJWT({
			id: user.id,
			twoFactorEnabled: user.twoFactorEnabled,
			authorized2fa: false,
		});

		return {
			jwt,
			authorized: !user.twoFactorEnabled,
		};
	}

	// async generate2fa(userId: number) {
	// 	const secret = authenticator.generateSecret();

	// 	await this.userService.set2faSecret(secret, userId);

	// 	return {
	// 		secret,
	// 	};
	// }

	async validate2fa(userId: number, totp: string) {
		if (
			!authenticator.verify({
				token: totp,
				secret: (await this.userService.getMe(userId, true)).twoFactorSecret,
			})
		)
			throw new UnauthorizedException('totp is not good');

		return {
			jwt: await this.signJWT({
				id: userId,
				twoFactorEnabled: true,
				authorized2fa: true,
			}),
		};
	}
}
