import { ExecutionContext, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserGetService {
	constructor(private prisma: PrismaService) {}

	async getOther(context: ExecutionContext): Promise<User> {
		const request = context.switchToHttp().getRequest();

		if (request.other) {
			return request.other;
		}

		const other_id = parseInt(request.params.id);
		let other;

		if (isNaN(other_id)) {
			other = await this.prisma.user.findUnique({
				where: {
					login42: request.params.id,
				},
			});
		} else {
			other = await this.prisma.user.findUnique({
				where: {
					id: other_id,
				},
			});
		}
		if (!other) {
			throw new NotFoundException('User not found');
		}
		request.other = other;
		return other;
	}
}
