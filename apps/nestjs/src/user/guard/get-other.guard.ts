import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserGetService } from './userGet.service';

@Injectable()
export class GetOtherGuard implements CanActivate {
	constructor(private userGetService: UserGetService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		await this.userGetService.getOther(context);
		return true;
	}
}
