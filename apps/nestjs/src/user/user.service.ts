import { Injectable } from '@nestjs/common';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}
	// create(createUserDto: CreateUserDto) {
	// 	return 'This action adds a new user';
	// }

	findAll() {
		return this.prisma.user.findMany();
	}

	async findOneBySchoolId(schoolId: string) {
		return await this.prisma.user.findUnique({ where: { schoolId } });
	}

	async findOneById(id: number) {
		return await this.prisma.user.findUnique({ where: { id } });
	}

	// update(id: number, updateUserDto: UpdateUserDto) {
	// 	return `This action updates a #${id} user`;
	// }

	remove(id: number) {
		return `This action removes a #${id} user`;
	}

	async set2fa(secret: string, userId: number) {
		return this.prisma.user.update({
			where: {
				id: userId,
			},
			data: {
				twoFactorSecret: secret,
				twoFactorEnabled: true,
			},
		});
	}
}
