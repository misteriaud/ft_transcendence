import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RoomGetService } from './roomGet.service';

@Injectable()
export class GetMemberGuard implements CanActivate {
	constructor(private roomGetService: RoomGetService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		await this.roomGetService.getMember(context);
		return true;
	}
}
