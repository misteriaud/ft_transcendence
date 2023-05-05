import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaUserService } from './prismaUser.service';
import { UserGetService } from './guard/userGet.service';

@Module({
	controllers: [UserController],
	providers: [UserService, PrismaUserService, UserGetService],
})
export class UserModule {}
