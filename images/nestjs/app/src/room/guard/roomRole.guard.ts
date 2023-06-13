import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Member } from '@prisma/client';
import { e_member_role_Level } from './memberRoleLevel.enum';
import { RoomGetService } from './roomGet.service';

@Injectable()
export abstract class RoomRoleGuard implements CanActivate {
	constructor(private roomGetService: RoomGetService) {}

	abstract required_level: e_member_role_Level;

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const userAsMember: Member = await this.roomGetService.getUserAsMember(context);

		if (e_member_role_Level[userAsMember.role] < this.required_level) {
			throw new ForbiddenException('You cannot perform this action');
		}
		return true;
	}
}

@Injectable()
export class RoomOwnerGuard extends RoomRoleGuard {
	required_level = e_member_role_Level.OWNER;
}

@Injectable()
export class RoomAdminGuard extends RoomRoleGuard {
	required_level = e_member_role_Level.ADMIN;
}

@Injectable()
export class RoomMemberGuard extends RoomRoleGuard {
	required_level = e_member_role_Level.MEMBER;
}
