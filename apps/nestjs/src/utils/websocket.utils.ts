import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { i_JWTPayload } from 'src/auth/interface/jwt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';

@WebSocketGateway()
export class BaseWebsocketGateway {
	@WebSocketServer()
	server: Server;

	constructor(private jwtService: JwtService, private userService: UserService) {}

	async handleConnection(client: Socket) {
		const token = client.handshake.auth.token;
		let payload: i_JWTPayload;

		if (!token) return client.conn.close();
		try {
			payload = this.jwtService.verify(token);
		} catch (err: any) {
			return client.disconnect();
		}

		client.data['user'] = await this.userService.getMe(payload.id);

		/*
		unauthorized if:
			- 2fa is enable and 2fa TOTP wasnt yet validated
			- twoFactorEnabled is marked as DISABLE in the token and ENABLE in the DB
		*/
		if (!client.data['user'] || (client.data['user'].twoFactorEnabled && !payload.authorized2fa) || payload.twoFactorEnabled != client.data['user'].twoFactorEnabled) {
			return client.disconnect();
		}
		client.join(payload.id.toString());
	}
}
