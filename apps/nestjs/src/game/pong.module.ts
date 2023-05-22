import { Module } from '@nestjs/common';
import { PongWebsocketGateway } from './pong.gateway';
import { UserModule } from '../user/user.module';
import { UserService } from 'src/user/user.service';
import { PrismaUserService } from 'src/user/prismaUser.service';

@Module({
	imports: [UserModule],
	providers: [PongWebsocketGateway, UserService, PrismaUserService],
})
export class PongModule {}
