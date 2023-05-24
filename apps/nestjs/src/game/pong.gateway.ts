import { WsException } from '@nestjs/websockets';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { BaseWebsocketGateway } from 'src/utils/websocket.utils';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { SubscribeMessage } from '@nestjs/websockets';
import { Socket } from 'socket.io';

const CANVAS_SIZE = 500;

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
		this.ball = { x: 250, y: 250, dx: 2 * (Math.random() > 0.5 ? 1 : -1), dy: -2 * (Math.random() > 0.5 ? 1 : -1) };
		this.player1 = { paddleY: CANVAS_SIZE / 2, score: 0 };
		this.player2 = { paddleY: CANVAS_SIZE / 2, score: 0 };
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
			if (this.currentGame[gameIndex].playersReady.every(Boolean)) {
				this.startGame(gameIndex);
			}
		}
		this.sendGameState(this.currentGame[client.data.gameIndex]);
	}

	@UsePipes(new ValidationPipe())
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
			if (direction === 'up' && currentGame.player1.paddleY - speed > 0) {
				currentGame.player1.paddleY -= speed;
			} else if (direction === 'down' && currentGame.player1.paddleY + speed < 500 - currentGame.paddleHeight) {
				currentGame.player1.paddleY += speed;
			} else if (direction === 'stop') {
				currentGame.player1.paddleY = currentGame.player1.paddleY;
			}
		} else if (client.data.playerIndex === 1) {
			//player2
			if (direction === 'up' && currentGame.player2.paddleY - speed > 0) {
				currentGame.player2.paddleY -= speed;
			} else if (direction === 'down' && currentGame.player2.paddleY + speed < 500 - currentGame.paddleHeight) {
				currentGame.player2.paddleY += speed;
			} else if (direction === 'stop') {
				currentGame.player2.paddleY = currentGame.player2.paddleY;
			}
		}

		this.sendGameState(currentGame);
	}

	startGame(gameIndex: number) {
		setInterval(() => {
			const game = this.currentGame[gameIndex];
			if (game.playersReady.every(Boolean)) {
				this.updateGameState(game);
			}
			if (game.player1.score >= 10 || game.player2.score >= 10) {
				this.endGame(gameIndex);
			}
		}, 1000 / 60);
	}

	endGame(gameIndex: number) {
		const game = this.currentGame[gameIndex];
		this.server.to(game.playersIds.map((id) => id.toString())).emit('pong/gameEnded', game);
		this.currentGame.splice(gameIndex, 1);
	}

	resetBall(game: GameState) {
		game.ball.x = 250;
		game.ball.y = 250;
		game.ball.dx = 2 * (Math.random() > 0.5 ? 1 : -1);
		game.ball.dy = -2 * (Math.random() > 0.5 ? 1 : -1);
	}

	updateGameState(game: GameState) {
		game.ball.x += game.ball.dx;
		game.ball.y += game.ball.dy;
		if (game.ball.y + game.ball.dy < game.ballRadius || game.ball.y + game.ball.dy > 500 - game.ballRadius) {
			game.ball.dy = -game.ball.dy;
		}
		if (game.ball.dx > 0) {
			if (game.ball.y + game.ballRadius > game.player2.paddleY && game.ball.y - game.ballRadius < game.player2.paddleY + game.paddleHeight && game.ball.x + game.ballRadius > 500 - game.paddleWidth) {
				game.ball.dx = -game.ball.dx;
			} else if (game.ball.x > 500) {
				game.player1.score++;
				this.resetBall(game);
			}
		} else {
			if (game.ball.y + game.ballRadius > game.player1.paddleY && game.ball.y - game.ballRadius < game.player1.paddleY + game.paddleHeight && game.ball.x - game.ballRadius < game.paddleWidth) {
				game.ball.dx = -game.ball.dx;
			} else if (game.ball.x < 0) {
				game.player2.score++;
				this.resetBall(game);
			}
		}

		this.sendGameState(game);
	}

	@UsePipes(new ValidationPipe())
	@SubscribeMessage('pong/stop')
	sendGameState(currentGame: GameState) {
		this.server.to(currentGame.playersIds.map((id) => id.toString())).emit('pong/gameState', currentGame);
		console.log(currentGame);
	}

	async handleDisconnect(client: Socket) {
		super.handleDisconnect(client);
		//this.server.emit('userDisconnected', client.id);

		const gameIndex = this.currentGame.findIndex((game) => game.playersIds.includes(client.data.user.id));
		if (gameIndex !== -1) {
			this.endGame(gameIndex);
		}
	}
}
