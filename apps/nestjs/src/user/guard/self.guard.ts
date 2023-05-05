import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserGetService } from './userGet.service';

@Injectable()
export class SelfGuard implements CanActivate {
	constructor(private userGetService: UserGetService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const user: User = request.user;
		const other: User = await this.userGetService.getOther(context);

		if (user.id === other.id) {
			throw new ForbiddenException('You cannot perform this action on yourself');
		}
		return true;
	}
}
