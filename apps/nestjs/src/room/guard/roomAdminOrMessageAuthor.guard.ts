import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RoomAdminGuard } from './roomRole.guard';
import { MessageAuthorGuard } from './messageAuthor.guard';

@Injectable()
export class RoomAdminOrMessageAuthorGuard implements CanActivate {
	constructor(private roomAdminGuard: RoomAdminGuard, private messageAuthorGuard: MessageAuthorGuard) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		try {
			await this.roomAdminGuard.canActivate(context);
			return true;
		} catch {
			await this.messageAuthorGuard.canActivate(context);
			return true;
		}
	}
}
