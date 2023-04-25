import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { JWTGuard } from 'src/auth/JWT.guard';
import { GetUser } from 'src/auth/decorator';

@UseGuards(JWTGuard)
@Controller('users')
export class UserController {
	@Get('me')
	getMe(@GetUser() user: User) {
		return user;
	}
}
