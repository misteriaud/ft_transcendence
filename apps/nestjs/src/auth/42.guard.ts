import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class FortyTwoOAuthGuard extends AuthGuard('42') {
	// constructor(private jwtService: JwtService) {
	// 	super();
	// }
	// canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
	// 	const request = context.switchToHttp().getRequest();
	// 	const token = this.extractTokenFromHeader(request);
	// 	if (!token) return super.canActivate(context);
	// 	try {
	// 		request['user'] = this.jwtService.verify(token);
	// 	} catch (err: any) {
	// 		throw new UnauthorizedException('invalid JWT');
	// 	}
	// 	return true;
	// }
	// private extractTokenFromHeader(request: Request): string | undefined {
	// 	const [type, token] = request.headers.authorization?.split(' ') ?? [];
	// 	return type === 'Bearer' ? token : undefined;
	// }
}
