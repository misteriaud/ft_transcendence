import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaUserService } from './prismaUser.service';
import { UserGetService } from './guard/userGet.service';

@Module({
	controllers: [UserController],
	providers: [UserService, PrismaUserService, UserGetService],
})
export class UserModule {}
