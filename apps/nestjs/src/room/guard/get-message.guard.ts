import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RoomGetService } from './roomGet.service';

@Injectable()
export class GetMessageGuard implements CanActivate {
	constructor(private roomGetService: RoomGetService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		await this.roomGetService.getMessage(context);
		return true;
	}
}
