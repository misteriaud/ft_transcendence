import { WsException } from '@nestjs/websockets';
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
	playersReady: boolean[];

	constructor() {
		this.ball = { x: 250, y: 250, dx: 2, dy: 2 };
		this.player1 = { paddleY: 200, score: 0 };
		this.player2 = { paddleY: 200, score: 0 };
		this.paddleHeight = 80;
		this.paddleWidth = 10;
		this.ballRadius = 10;
		this.playersIds = [];
		this.playersReady = [false, false];
	}
}

export class PongWebsocketGateway extends BaseWebsocketGateway {
	currentGame: GameState[] = [];

	constructor(jwtService: JwtService, userService: UserService) {
		super(jwtService, userService);
	}

	@SubscribeMessage('pong/ready')
	handlePongReady(client: Socket) {
		console.log('Player ready');
		const gameIndex = this.currentGame.findIndex((game) => game.playersIds.length < 2);

		if (gameIndex !== -1 && this.currentGame[gameIndex].playersIds.includes(client.data.user.id)) {
			console.log('Player already in game');
			throw new WsException('Player already in game');
			//return;
		}
		if (gameIndex === -1) {
			const newGame = new GameState();
			this.currentGame.push(newGame);
			newGame.playersIds.push(client.data.user.id);
			newGame.playersReady[0] = true;
			client.data.gameIndex = this.currentGame.length - 1;
			client.data.playerIndex = 0;
		} else {
			this.currentGame[gameIndex].playersIds.push(client.data.user.id);
			this.currentGame[gameIndex].playersReady[1] = true;
			client.data.gameIndex = gameIndex;
			client.data.playerIndex = 1;
		}
		this.sendGameState(this.currentGame[client.data.gameIndex]);
	}

	@SubscribeMessage('pong/movePaddle')
	handlePaddleMove(client: Socket, direction: 'up' | 'down' | 'stop') {
		const speed = 5;
		const currentGame = this.currentGame[client.data.gameIndex];

		if (!currentGame.playersReady.every(Boolean)) {
			console.log('Not all players are ready');
			return;
		}
		// Check if players are moving paddles
		if (client.data.playerIndex === 0) {
			//player1
			if (direction === 'up') {
				currentGame.player1.paddleY -= speed;
			} else if (direction === 'down') {
				currentGame.player1.paddleY += speed;
			} else if (direction === 'stop') {
				currentGame.player1.paddleY = currentGame.player1.paddleY;
			}
		} else if (client.data.playerIndex === 1) {
			//player2
			if (direction === 'up') {
				currentGame.player2.paddleY -= speed;
			} else if (direction === 'down') {
				currentGame.player2.paddleY += speed;
			} else if (direction === 'stop') {
				currentGame.player2.paddleY = currentGame.player2.paddleY;
			}
		}

		this.sendGameState(currentGame);
	}
	@SubscribeMessage('pong/stop')
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
