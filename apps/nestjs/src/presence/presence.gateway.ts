import { JwtService } from '@nestjs/jwt';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { UserService } from 'src/user/user.service';
import { BaseWebsocketGateway } from 'src/utils/websocket.utils';
import { Socket, Server } from 'socket.io';

enum e_user_status {
	ONLINE = 'ONLINE',
	INQUEUE = 'INQUEUE',
	INGAME = 'INGAME',
	OFFLINE = 'OFFLINE',
}

interface StatusUpdate {
	id: number;
	status: e_user_status;
}

@WebSocketGateway()
export class PresenceWebsocketGateway extends BaseWebsocketGateway {
	private status: Map<number, e_user_status> = new Map();

	constructor(jwtService: JwtService, userService: UserService) {
		super(jwtService, userService);
	}

	async handleConnection(client: Socket) {
		await super.handleConnection(client);

		this.status.set(client.data.user.id, e_user_status.ONLINE);
		this.broadcastUpdate({
			id: client.data.user.id,
			status: e_user_status.ONLINE,
		});
		console.log(this.status);
		client.emit('presence/init', Array.from(this.status));
	}

	async handleDisconnect(client: Socket) {
		await super.handleDisconnect(client);
		this.status.delete(client.data.user.id);
		this.broadcastUpdate({
			id: client.data.user.id,
			status: e_user_status.OFFLINE,
		});
		console.log(this.status);
	}

	async broadcastUpdate(update: StatusUpdate) {
		this.server.emit('presence/update', update);
	}

	@SubscribeMessage('presence/getAll')
	handleMessage(client: Socket) {
		return this.status;
	}
}
