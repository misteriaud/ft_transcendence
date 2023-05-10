import { CanActivate, Injectable, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserService } from 'src/user/user.service';
import { i_JWTPayload } from './interface/jwt';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class UnauthorizedJWTGuard implements CanActivate {
	constructor(private jwtService: JwtService, private userService: UserService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const token = this.extractTokenFromHeader(request);
		if (!token) throw new ForbiddenException('missing JWT');
		try {
			const payload: i_JWTPayload = this.jwtService.verify(token);
			request['user'] = await this.userService.getMe(payload.id);
		} catch (err: any) {
			throw new ForbiddenException('invalid JWT');
		}
		return true;
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}
}

@Injectable()
export class JWTGuard implements CanActivate {
	constructor(private jwtService: JwtService, private userService: UserService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const token = this.extractTokenFromHeader(request);
		let payload: i_JWTPayload;

		if (!token) throw new ForbiddenException('missing JWT');
		try {
			payload = this.jwtService.verify(token);
		} catch (err: any) {
			throw new ForbiddenException('invalid JWT');
		}

		request['user'] = await this.userService.getMe(payload.id);

		/*
		unauthorized if:
			- 2fa is enable and 2fa TOTP wasnt yet validated
			- twoFactorEnabled is marked as DISABLE in the token and ENABLE in the DB
		*/
		if ((request['user'].twoFactorEnabled && !payload.authorized2fa) || payload.twoFactorEnabled != request['user'].twoFactorEnabled) {
			throw new ForbiddenException('2fa not valid');
		}
		return true;
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}
}

@Injectable()
export class WSJWTGuard implements CanActivate {
	constructor(private jwtService: JwtService, private userService: UserService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const client = context.switchToWs().getClient();
		const token = client.handshake.headers.authorization
		console.log(token)
		let payload: i_JWTPayload;

		if (!token) throw new WsException('missing JWT');
		try {
			payload = this.jwtService.verify(token);
		} catch (err: any) {
			throw new WsException('invalid JWT');
		}

		client.data['user'] = await this.userService.getMe(payload.id);

		/*
		unauthorized if:
			- 2fa is enable and 2fa TOTP wasnt yet validated
			- twoFactorEnabled is marked as DISABLE in the token and ENABLE in the DB
		*/
		if ((client.data['user'].twoFactorEnabled && !payload.authorized2fa) || payload.twoFactorEnabled != client.data['user'].twoFactorEnabled) {
			throw new WsException('2fa not valid');
		}
		return true;
	}
}
