import { UseGuards } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, ConnectedSocket, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { WSJWTGuard } from 'src/auth/JWT.guard';
import { i_JWTPayload } from 'src/auth/interface/jwt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';

@WebSocketGateway()
export class WebsocketGateway {
	// @WebSocketServer()
	// server: Server;
	constructor(private jwtService: JwtService, private userService: UserService) {}

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
		if ((client.data['user'].twoFactorEnabled && !payload.authorized2fa) || payload.twoFactorEnabled != client.data['user'].twoFactorEnabled) {
			client.conn.close();
		}
	}

	// async handleDisconnect() {
	// 	// // A client has disconnected
	// 	// this.users--;

	// 	// // Notify connected clients of current users
	// 	// this.server.emit('users', this.users);
	// 	console.log("user diconnect")
	// }

	@SubscribeMessage('message')
	handleMessage(@ConnectedSocket() client: Socket, @MessageBody() data: string): string {
		// console.log(client.data.user)
		console.log(data)
		return 'Hello world!';
	}
}
