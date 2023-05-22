import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { RoomGetService } from './roomGet.service';
import { Member, Message } from '@prisma/client';

@Injectable()
export class MessageAuthorGuard implements CanActivate {
	constructor(private roomGetService: RoomGetService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const userAsMember: Member = await this.roomGetService.getUserAsMember(context);
		const message: Message = await this.roomGetService.getMessage(context);

		if (userAsMember.user_id !== message.user_id) {
			throw new ForbiddenException('You are not the author of this message');
		}
		return true;
	}
}
