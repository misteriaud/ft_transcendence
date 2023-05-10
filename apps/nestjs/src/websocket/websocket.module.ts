import { Module } from '@nestjs/common';
import { PrismaUserService } from 'src/user/prismaUser.service';
import { UserService } from 'src/user/user.service';
import { WebsocketGateway } from './websocket.gateway';

@Module({
  providers: [WebsocketGateway, UserService, PrismaUserService],
})
export class WebsocketModule {}
