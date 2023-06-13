import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserService } from 'src/user/user.service';
import { i_JWTPayload } from '../interface/jwt';

@Injectable()
export class UnauthorizedJWTGuard {
	constructor(private readonly jwtService: JwtService, private readonly userService: UserService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const token = this.extractTokenFromHeader(request);

		let payload: i_JWTPayload;

		if (!token) throw new UnauthorizedException('missing JWT');

		try {
			payload = this.jwtService.verify(token);
		} catch (err: any) {
			throw new UnauthorizedException('invalid JWT');
		}

		request['user'] = await this.userService.getMe(payload.id);
		if (!request['user']) throw new UnauthorizedException('Unknown user');
		request['jwtPayload'] = payload;

		return true;
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}
}

@Injectable()
export class JWTGuard extends UnauthorizedJWTGuard {
	constructor(jwtService: JwtService, userService: UserService) {
		super(jwtService, userService);
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		await super.canActivate(context);
		const request = context.switchToHttp().getRequest();

		const { twoFactorEnabled, authorized2fa } = request['jwtPayload'];

		// Unauthorized if 2fa is enable and 2fa TOTP wasnt yet validated
		if (twoFactorEnabled && !authorized2fa) {
			throw new UnauthorizedException('Invalid 2FA');
		}

		return true;
	}
}
