import { Controller, Get, Post, Request, UseGuards, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FortyTwoOAuthGuard } from './42.guard';
import { UnauthorizedJWTGuard } from './JWT.guard';
import { GetUser } from './decorator';
import { Validate2faDTO } from './DTO/2fa.dto';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@UseGuards(FortyTwoOAuthGuard)
	@Get('login')
	async login(@Request() req: any) {
		return this.authService.login(req);
	}

	@UseGuards(UnauthorizedJWTGuard)
	@Get('activate_2fa')
	async activate_2fa(@GetUser('id') userId: number) {
		return this.authService.generate2fa(userId);
	}

	@UseGuards(UnauthorizedJWTGuard)
	@Post('2fa')
	async verify2fa(@Body() body: Validate2faDTO, @GetUser('id') userId: number) {
		return this.authService.validate2fa(userId, body.totp);
	}
}
