import { UseGuards } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, ConnectedSocket, MessageBody, WebSocketServer, WsException } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { WSJWTGuard } from 'src/auth/JWT.guard';
import { i_JWTPayload } from 'src/auth/interface/jwt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { MessagePayload } from './interface/Room';
import { PrismaService } from 'src/prisma/prisma.service';

@WebSocketGateway()
export class WebsocketGateway {
	@WebSocketServer()
	server: Server;
	tmpId: number = 10;
	constructor(private jwtService: JwtService, private userService: UserService, private prisma: PrismaService) { }

	@UseGuards(WSJWTGuard)
	async handleConnection(client: Socket) {
		const token = client.handshake.headers.authorization
		let payload: i_JWTPayload;

		if (!token) client.conn.close();
		try {
			payload = this.jwtService.verify(token);
		} catch (err: any) {
			client.conn.close();
		}

		if (!payload.id)
			client.conn.close()
		client.data['user'] = await this.userService.getMe(payload.id);

		/*
		unauthorized if:
			- 2fa is enable and 2fa TOTP wasnt yet validated
			- twoFactorEnabled is marked as DISABLE in the token and ENABLE in the DB
		*/
		if (!client.data['user'] || (client.data['user'].twoFactorEnabled && !payload.authorized2fa) || payload.twoFactorEnabled != client.data['user'].twoFactorEnabled) {
			client.conn.close();
		}
		client.join(payload.id.toString())
	}

	// async handleDisconnect() {
	// 	// // A client has disconnected
	// 	// this.users--;

	// 	// // Notify connected clients of current users
	// 	// this.server.emit('users', this.users);
	// 	console.log("user diconnect")
	// }

	@SubscribeMessage('message')
	async handleMessage(@ConnectedSocket() client: Socket, @MessageBody() data: MessagePayload) {
		const room = await this.prisma.room.findUnique({
			where: { id: data.roomId },
			select: {
				id: true,
				members: {
					select: {
						user_id: true
					}
				}
			}
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
		this.server.to(room.members.map(member => member.user_id.toString())).emit("message", {
			id: this.tmpId++,
			roomId: data.roomId,
			sendBy: client.data.user.id,
			content: data.content
		})
		// client.emit("room-", data.content)
	}
}
