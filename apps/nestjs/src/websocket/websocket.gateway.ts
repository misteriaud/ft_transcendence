import { UseGuards } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, ConnectedSocket, MessageBody, WebSocketServer, WsException } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { i_JWTPayload } from 'src/auth/interface/jwt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { MessagePayload } from './interface/Room';
import { PrismaService } from 'src/prisma/prisma.service';

class GameState {
	ball: { x: number; y: number; dx: number; dy: number };
	player1: { paddleY: number; score: number };
	player2: { paddleY: number; score: number };
	paddleHeight: number;
	paddleWidth: number;
	ballRadius: number;
	playersIds: number[];

	constructor() {
		this.ball = { x: 250, y: 250, dx: 2, dy: 2 };
		this.player1 = { paddleY: 200, score: 0 };
		this.player2 = { paddleY: 200, score: 0 };
		this.paddleHeight = 80;
		this.paddleWidth = 10;
		this.ballRadius = 10;
		this.playersIds = [];
	}
}

@WebSocketGateway()
export class WebsocketGateway {
	@WebSocketServer()
	server: Server;
	currentGame: GameState[] = [];
	tmpId = 10;
	constructor(private jwtService: JwtService, private userService: UserService, private prisma: PrismaService) {}

	// @UseGuards(WSJWTGuard)
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

	@SubscribeMessage('pongReady')
	handlePongReady(client: Socket) {
		console.log('readyyyyy');
		this.currentGame.push(new GameState());
		const gameIndex = this.currentGame.length - 1;
		this.currentGame[gameIndex].playersIds.push(client.data.user.id);
		client.data.gameIndex = this.currentGame.length - 1;
		client.data.playerIndex = 0;
		this.sendGameState(this.currentGame[gameIndex]);
	}

	@SubscribeMessage('pong/movePaddle')
	handlePaddleMove(client: Socket, direction: 'up' | 'down') {
		const speed = 5;

		const currentGame = this.currentGame[client.data.gameIndex];

		if (direction === 'up') {
			currentGame['player1'].paddleY -= speed;
		} else {
			currentGame['player1'].paddleY += speed;
		}

		this.sendGameState(currentGame);
	}

	sendGameState(currentGame: GameState) {
		this.server.to(currentGame.playersIds.map((id) => id.toString())).emit('pong/gameState', currentGame);
		console.log(currentGame);
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
