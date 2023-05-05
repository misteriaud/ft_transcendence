import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RoomGetService } from './roomGet.service';

@Injectable()
export class GetRoomGuard implements CanActivate {
	constructor(private roomGetService: RoomGetService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		await this.roomGetService.getRoom(context);
		return true;
	}
}
