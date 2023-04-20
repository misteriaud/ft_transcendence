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

	async findOne(schoolId: string) {
		return await this.prisma.user.findUnique({ where: { schoolId } });
	}

	// update(id: number, updateUserDto: UpdateUserDto) {
	// 	return `This action updates a #${id} user`;
	// }

	remove(id: number) {
		return `This action removes a #${id} user`;
	}
}
