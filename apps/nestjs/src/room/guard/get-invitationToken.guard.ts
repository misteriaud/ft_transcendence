import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RoomGetService } from './roomGet.service';

@Injectable()
export class GetInvitationTokenGuard implements CanActivate {
	constructor(private roomGetService: RoomGetService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		this.roomGetService.getInvitationToken(context);
		return true;
	}
}
