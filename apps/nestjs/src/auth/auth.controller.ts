import { Controller, Get, Headers, Query, Request, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FortyTwoOAuthGuard } from './42.guard';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Get()
	@UseGuards(FortyTwoOAuthGuard)
	login() {
		console.log('get /auth');
	}

	@Get('callback')
	@UseGuards(FortyTwoOAuthGuard)
	async callback(@Request() req: any) {
		return this.authService.login(req);
	}

	// @Get('me')
	// @UseGuards(FortyTwoOAuthGuard)
	// async me(@Request() req: any) {
	// 	return this.authService.me(req);
	// }

	@Get('2fa')
	async verify2fa(@Headers('Authorization') jwt: string, @Query('token') totp: string) {
		const [type, jwt_token] = jwt?.split(' ') ?? [];
		if (!jwt_token) throw new UnauthorizedException('JWT Missing');
		return this.authService.validate2fa(jwt_token, totp);
	}
}
