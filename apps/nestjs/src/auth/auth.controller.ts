import { Controller, Get, Headers, Query, Request, UseGuards, UnauthorizedException, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FortyTwoOAuthGuard } from './42.guard';
import { UnauthorizedJWTGuard } from './JWT.guard';
import { GetUser } from './decorator';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@UseGuards(FortyTwoOAuthGuard)
	@Get('callback')
	async callback(@Request() req: any) {
		return this.authService.login(req);
	}

	@UseGuards(UnauthorizedJWTGuard)
	@Get('activate_2fa')
	async activate_2fa(@GetUser('id') userId: number) {
		return this.authService.generate2fa(userId);
	}

	@UseGuards(UnauthorizedJWTGuard)
	@Get('2fa')
	async verify2fa(@GetUser('id') userId: number, @Body('totp') totp: string) {
		return this.authService.validate2fa(userId, totp);
	}
}
