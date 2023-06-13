import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RoomGetService } from './roomGet.service';

@Injectable()
export class GetInvitationGuard implements CanActivate {
	constructor(private roomGetService: RoomGetService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		await this.roomGetService.getInvitation(context);
		return true;
	}
}
