import { CanActivate, ConflictException, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserGetService } from './userGet.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BlockedGuard implements CanActivate {
	constructor(private prisma: PrismaService, private userGetService: UserGetService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const user: User = request.user;
		const other: User = await this.userGetService.getOther(context);
		const blockRequest = request.route.path === '/users/:id/block' && request.route.methods.post;
		const unblockRequest = request.route.path === '/users/:id/block' && request.route.methods.delete;

		const userBlockOther = await this.prisma.blocked.findUnique({
			where: {
				userA_id_userB_id: {
					userA_id: user.id,
					userB_id: other.id,
				},
			},
		});

		if (!blockRequest && !unblockRequest) {
			if (userBlockOther) {
				throw new ForbiddenException('You have blocked this user');
			}
		} else {
			if (blockRequest && userBlockOther) {
				throw new ConflictException('This user is already blocked');
			}
			if (unblockRequest && !userBlockOther) {
				throw new ConflictException('This user is not blocked');
			}
		}

		const otherBlockUser = await this.prisma.blocked.findUnique({
			where: {
				userA_id_userB_id: {
					userA_id: other.id,
					userB_id: user.id,
				},
			},
		});

		if (!blockRequest && !unblockRequest) {
			if (otherBlockUser) {
				throw new ForbiddenException('You have been blocked by this user');
			}
		}

		return true;
	}
}
