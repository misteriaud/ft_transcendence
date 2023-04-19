import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
	@Get('me2')
	getMe(@GetUser() user: User) {
		return user;
	}
}
