import { CanActivate, Injectable, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserService } from 'src/user/user.service';

@Injectable()
export class UnauthorizedJWTGuard implements CanActivate {
	constructor(private jwtService: JwtService, private userService: UserService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const token = this.extractTokenFromHeader(request);
		if (!token) throw new ForbiddenException('missing JWT');
		try {
			const payload = this.jwtService.verify(token);
			request['user'] = await this.userService.findOneById(payload.id);
			delete request['user']['twoFactorSecret'];
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
		if (!token) throw new ForbiddenException('missing JWT');
		try {
			const payload = this.jwtService.verify(token);
			request['user'] = await this.userService.findOneById(payload.id);
			console.log(request['user']);
			// delete request['user']['twoFactorSecret'];

			if (!payload.authorized || payload.twoFactorEnabled != request['user'].twoFactorEnabled) {
				throw new UnauthorizedException('2fa not valide');
			}
		} catch (err: any) {
			console.log(err);
			throw new ForbiddenException('invalid JWT');
		}
		return true;
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}
}
