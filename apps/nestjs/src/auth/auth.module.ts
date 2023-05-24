import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { FortyTwoStrategy } from './42.strategy';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { PrismaUserService } from 'src/user/prismaUser.service';

@Module({
	imports: [UserModule, PassportModule],
	providers: [AuthService, FortyTwoStrategy, UserService, PrismaUserService],
	controllers: [AuthController],
})
export class AuthModule {}
