// import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
// import { Socket } from 'socket.io';

import { BaseWebsocketGateway } from 'src/utils/websocket.utils';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { SubscribeMessage } from '@nestjs/websockets';
import { Socket } from 'socket.io';

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

export class PongWebsocketGateway extends BaseWebsocketGateway {
	currentGame: GameState[] = [];

	constructor(jwtService: JwtService, userService: UserService) {
		super(jwtService, userService);
	}

	@SubscribeMessage('pong/ready')
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
}

// class GameState {
// 	ball: { x: number; y: number; dx: number; dy: number };
// 	player1: { paddleY: number; score: number };
// 	player2: { paddleY: number; score: number };
// 	paddleHeight: number;
// 	paddleWidth: number;
// 	ballRadius: number;

// 	constructor() {
// 		this.ball = { x: 250, y: 250, dx: 2, dy: 2 };
// 		this.player1 = { paddleY: 200, score: 0 };
// 		this.player2 = { paddleY: 200, score: 0 };
// 		this.paddleHeight = 80;
// 		this.paddleWidth = 10;
// 		this.ballRadius = 10;
// 	}
// }

// @WebSocketGateway()
// export class PongGateway implements OnGatewayConnection, OnGatewayDisconnect {
// 	game: GameState;
// 	clients: Socket[] = [];

// 	handleConnection(client: Socket, ...args: any[]) {
// 		console.log(`Client connected: ${client.id}`);
// 		this.clients.push(client);

// 		if (this.clients.length === 2) {
// 			this.startGame();
// 		}
// 	}

// 	handleDisconnect(client: Socket) {
// 		console.log(`Client disconnected: ${client.id}`);
// 		this.clients = this.clients.filter((c) => c.id !== client.id);
// 	}

// 	@SubscribeMessage('movePaddle')
// 	handlePaddleMove(client: Socket, payload: { direction: 'up' | 'down'; player: 'player1' | 'player2' }) {
// 		const speed = 5;

// 		if (payload.direction === 'up') {
// 			this.game[payload.player].paddleY -= speed;
// 		} else {
// 			this.game[payload.player].paddleY += speed;
// 		}

// 		this.sendGameState();
// 	}

// 	startGame() {
// 		setInterval(() => {
// 			this.game.ball.x += this.game.ball.dx;
// 			this.game.ball.y += this.game.ball.dy;

// 			// Collision with top and bottom wall
// 			if (this.game.ball.y + this.game.ball.dy < this.game.ballRadius || this.game.ball.y + this.game.ball.dy > 500 - this.game.ballRadius) {
// 				this.game.ball.dy = -this.game.ball.dy;
// 			}

// 			// Collision detection with paddles
// 			if (this.game.ball.x < 0 + this.game.paddleWidth && this.game.ball.y > this.game.player1.paddleY && this.game.ball.y < this.game.player1.paddleY + this.game.paddleHeight) {
// 				this.game.ball.dx = -this.game.ball.dx;
// 			} else if (this.game.ball.x > 500 - this.game.paddleWidth && this.game.ball.y > this.game.player2.paddleY && this.game.ball.y < this.game.player2.paddleY + this.game.paddleHeight) {
// 				this.game.ball.dx = -this.game.ball.dx;
// 			}

// 			// Scoring
// 			if (this.game.ball.x + this.game.ball.dx < this.game.ballRadius) {
// 				// Player 2 scores
// 				this.game.player2.score += 1;
// 				this.game.ball = { x: 250, y: 250, dx: 2, dy: 2 };
// 			} else if (this.game.ball.x + this.game.ball.dx > 500 - this.game.ballRadius) {
// 				// Player 1 scores
// 				this.game.player1.score += 1;
// 				this.game.ball = { x: 250, y: 250, dx: 2, dy: 2 };
// 			}

// 			this.sendGameState();
// 		}, 1000 / 60); // 60 FPS
// 	}

// 	sendGameState() {
// 		this.clients.forEach((client) => {
// 			client.emit('gameState', this.game);
// 		});
// 	}
// }
