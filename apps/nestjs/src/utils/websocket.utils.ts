import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { i_JWTPayload } from 'src/auth/interface/jwt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { e_user_status } from '@prisma/client';

export interface StatusUpdate {
	id: number;
	status: e_user_status;
}

@WebSocketGateway()
export class BaseWebsocketGateway {
	@WebSocketServer()
	server: Server;
	static status: Map<number, e_user_status> = new Map();

	private readonly logger = new Logger(BaseWebsocketGateway.name);

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

		// user join is personal room
		client.join(payload.id.toString());

		// setting initial presence
		this.updateUserStatus(client.data.user.id, e_user_status.ONLINE);
		// sending
		client.emit('presence/init', Array.from(BaseWebsocketGateway.status));
	}

	async handleDisconnect(client: Socket) {
		this.updateUserStatus(client.data.user.id, e_user_status.OFFLINE);
	}

	async updateUserStatus(userId: number, status: e_user_status) {
		if (!userId) return;

		if (status === e_user_status.OFFLINE) BaseWebsocketGateway.status.delete(userId);
		else BaseWebsocketGateway.status.set(userId, status);

		this.server.emit('presence/update', {
			id: userId,
			status,
		});
	}
}
