import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { FortyTwoOAuthGuard } from 'src/auth/42.guard';
// import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';

@UseGuards(FortyTwoOAuthGuard)
@Controller('users')
export class UserController {
	@Get('me')
	getMe(@GetUser() user: User) {
		return user;
	}
}
