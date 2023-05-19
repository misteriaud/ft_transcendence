import { SubscribeMessage, WebSocketGateway, ConnectedSocket, MessageBody, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { MessagePayload } from './interface/Room';
import { PrismaService } from 'src/prisma/prisma.service';
import { BaseWebsocketGateway } from 'src/utils/websocket.utils';

@WebSocketGateway()
export class ChatWebsocketGateway extends BaseWebsocketGateway {
	constructor(jwtService: JwtService, userService: UserService, private prisma: PrismaService) {
		super(jwtService, userService);
	}

	@SubscribeMessage('chat/message')
	async handleMessage(@ConnectedSocket() client: Socket, @MessageBody() data: MessagePayload) {
		const room = await this.prisma.room.findUnique({
			where: { id: data.roomId },
			select: {
				id: true,
				members: {
					select: {
						user_id: true,
					},
				},
			},
		});
		const userAsMember = await this.prisma.member.findUnique({
			where: {
				room_id_user_id: {
					room_id: room.id,
					user_id: client.data.user.id,
				},
			},
		});

		if (!userAsMember) {
			throw new WsException('You are not a member of this room');
		}
		if (userAsMember.banned) {
			throw new WsException('You are banned from this room');
		}
		// save message in DB
		this.server.to(room.members.map((member) => member.user_id.toString())).emit('message', {
			id: this.tmpId++,
			roomId: data.roomId,
			sendBy: client.data.user.id,
			content: data.content,
		});
		// client.emit("room-", data.content)
	}
}
