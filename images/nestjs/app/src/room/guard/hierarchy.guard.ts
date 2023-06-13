import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Member } from '@prisma/client';
import { e_member_role_Level } from './memberRoleLevel.enum';
import { RoomGetService } from './roomGet.service';

@Injectable()
export class HierarchyGuard implements CanActivate {
	constructor(private roomGetService: RoomGetService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const userAsMember: Member = await this.roomGetService.getUserAsMember(context);
		const member: Member = await this.roomGetService.getMember(context);

		if (e_member_role_Level[userAsMember.role] < e_member_role_Level[member.role]) {
			throw new ForbiddenException('You cannot perform this action');
		}
		if (userAsMember.user_id === member.user_id) {
			throw new ForbiddenException('You cannot perform this action on yourself');
		}
		return true;
	}
}
