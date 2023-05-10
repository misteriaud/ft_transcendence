import { Controller, Get, Post, Request, UseGuards, Body, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FortyTwoOAuthGuard } from './42.guard';
import { UnauthorizedJWTGuard } from './JWT.guard';
import { GetOAuthUser, GetUser } from './decorator';
import { Validate2faDTO } from './DTO/2fa.dto';
import { Profile } from 'passport';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@UseGuards(FortyTwoOAuthGuard)
	@Get('login')
	async login(@GetOAuthUser() profile: Profile) {
		return this.authService.login(profile);
	}


	// CONNECT WITH FAKE PROFILE
	@Get('login_fake')
	async loginFake(@Query('name') name: string) {
		console.log(name)
		const fakeProfile: Profile = {
			id: "0",
			username: name,
			displayName: name,
			provider: "Fake"
		}
		return this.authService.login(fakeProfile);
	}

	// @UseGuards(UnauthorizedJWTGuard)
	// @Get('activate_2fa')
	// async activate_2fa(@GetUser('id') userId: number) {
	// 	return this.authService.generate2fa(userId);
	// }

	@UseGuards(UnauthorizedJWTGuard)
	@Post('2fa')
	async verify2fa(@Body() body: Validate2faDTO, @GetUser('id') userId: number) {
		return this.authService.validate2fa(userId, body.totp);
	}
}
