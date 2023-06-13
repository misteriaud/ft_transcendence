import { Controller, Get, Post, UseGuards, Body, Query } from '@nestjs/common';
import { ApiOAuth2, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { GetOAuthUser, GetUser } from './decorator';
import { Validate2faDTO } from './DTO/2fa.dto';
import { FortyTwoOAuthGuard } from './guard/42.guard';
import { Profile } from 'passport';
import { UnauthorizedJWTGuard } from './guard/JWT.guard';

@ApiTags('auth')
@ApiOAuth2(['pets:write'])
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	/**
	 * Exchange OAuth2 42 Access Token against JWT token
	 */
	@UseGuards(FortyTwoOAuthGuard)
	@Get('login')
	async login(@GetOAuthUser() profile: Profile) {
		return this.authService.login(profile);
	}

	/**
	 * Exchange un unauthorized JWT and a TOTP against an authorized JWT
	 */
	@UseGuards(UnauthorizedJWTGuard)
	@Post('2fa')
	async verify2fa(@Body() body: Validate2faDTO, @GetUser('id') userId: number) {
		return this.authService.validate2fa(userId, body.totp);
	}
}
