import { Controller, Get, Post, UseGuards, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JWTGuard } from './JWT.guard';
import { GetOAuthUser, GetUser } from './decorator';
import { Validate2faDTO } from './DTO/2fa.dto';
import { FortyTwoOAuthGuard } from './42.guard';
import { Profile } from 'passport';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@UseGuards(FortyTwoOAuthGuard)
	@Get('login')
	async login(@GetOAuthUser() profile: Profile) {
		return this.authService.login(profile);
	}

	@UseGuards(JWTGuard)
	@Get('activate_2fa')
	async activate_2fa(@GetUser('id') userId: number) {
		return this.authService.generate2fa(userId);
	}

	@UseGuards(JWTGuard)
	@Post('2fa')
	async verify2fa(@Body() body: Validate2faDTO, @GetUser('id') userId: number) {
		return this.authService.validate2fa(userId, body.totp);
	}
}
