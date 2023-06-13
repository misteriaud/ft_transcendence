import { SubscribeMessage, WebSocketGateway, ConnectedSocket, MessageBody, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { MessagePayload } from './interface/Room';
import { BaseWebsocketGateway } from 'src/utils/websocket.utils';
import { PrismaRoomService } from './prismaRoom.service';

@WebSocketGateway()
export class ChatWebsocketGateway extends BaseWebsocketGateway {
	constructor(jwtService: JwtService, userService: UserService, private prismaRoom: PrismaRoomService) {
		super(jwtService, userService);
	}

	@SubscribeMessage('chat/postMessage')
	async handleMessage(@ConnectedSocket() client: Socket, @MessageBody() data: MessagePayload) {
		const roomMembers = await this.prismaRoom.getRoomMembers(data.roomId);
		const newMessage = await this.prismaRoom.createMessage(data.roomId, client.data.user.id, data.content);

		// save message in DB
		this.server.to(roomMembers.members.map((member) => member.user.id.toString())).emit(`chat/newMessage/${data.roomId}`, newMessage);
	}
}
