//pong.gateway.ts
import { WsException } from '@nestjs/websockets';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { BaseWebsocketGateway } from 'src/utils/websocket.utils';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { SubscribeMessage } from '@nestjs/websockets';
import { Socket } from 'socket.io';

const CANVAS_HEIGHT = 450;
const CANVAS_WIDTH = 800;

class Player {
	paddleY: number;
	score: number;
	paddleSpeed: number;
	paddleDirection: 'up' | 'down' | 'stop';
	paddleHeight: number;
}

class GameState {
	ball: { x: number; y: number; dx: number; dy: number; ax: number; ay: number };
	player1: Player;
	player2: Player;
	paddleWidth: number;
	ballRadius: number;
	playersIds: number[];
	playersReady: boolean[];
	gameInterval: NodeJS.Timeout | null;
	timestamp: number;

	constructor() {
		this.ball = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: CANVAS_HEIGHT / 75, dy: 0, ax: 0, ay: 0 };
		this.player1 = { paddleY: CANVAS_HEIGHT / 2, score: 0, paddleDirection: 'stop', paddleSpeed: 6, paddleHeight: 80 };
		this.player2 = { paddleY: CANVAS_HEIGHT / 2, score: 0, paddleDirection: 'stop', paddleSpeed: 6, paddleHeight: 80 };
		this.paddleWidth = 10;
		this.ballRadius = 6;
		this.playersIds = [];
		this.playersReady = [false, false];
		this.gameInterval = null;
		this.timestamp = Date.now();
	}

	resetBall() {
		this.ball.x = CANVAS_WIDTH / 2;
		this.ball.y = CANVAS_HEIGHT / 2;
		this.ball.dx = CANVAS_HEIGHT / 75;
		this.ball.dy = 0;
		this.ball.ax = 0;
		this.ball.ay = 0;
		return this.ball;
	}
}

export class PongWebsocketGateway extends BaseWebsocketGateway {
	currentGame: GameState[] = [];

	constructor(jwtService: JwtService, userService: UserService) {
		super(jwtService, userService);
	}

	@UsePipes(new ValidationPipe())
	@SubscribeMessage('pong/ready')
	handlePongReady(client: Socket) {
		console.log('Player ready');
		const gameIndex = this.currentGame.findIndex((game) => game.playersIds.length < 2);

		if (gameIndex !== -1 && this.currentGame[gameIndex].playersIds.includes(client.data.user.id)) {
			console.log('Player already in game');
			throw new WsException('Player already in game');
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
	}

	@SubscribeMessage('pong/sendGameState')
	sendGameState(currentGame: GameState) {
		currentGame.timestamp = Date.now();
		this.server.to(currentGame.playersIds.map((id) => id.toString())).emit('pong/gameState', currentGame);
		//console.log(currentGame);
	}

	@UsePipes(new ValidationPipe())
	async handleDisconnect(client: Socket) {
		super.handleDisconnect(client);
	}

	@SubscribeMessage('pong/movePaddle')
	handlePaddleMove(client: Socket, direction: 'up' | 'down' | 'stop') {
		const currentGame = this.currentGame[client.data.gameIndex];
		const currentPlayer = currentGame[`player${client.data.playerIndex + 1}`];

		if (!currentGame || !currentGame.playersReady.every(Boolean)) {
			console.log('Not all players are ready or game does not exist');
			return;
		}

		if (!currentPlayer) {
			console.log('Player does not exist');
			return;
		}

		currentPlayer.paddleDirection = direction;
	}

	startGame(gameIndex: number) {
		this.currentGame[gameIndex].gameInterval = setInterval(() => {
			const game = this.currentGame[gameIndex];
			if (game.playersReady.every(Boolean)) {
				this.UpdateBallState(game);
				this.updatePaddleState(game);
			}
			if (game.player1.score >= 11 || game.player2.score >= 11) {
				this.endGame(gameIndex);
			}

			this.sendGameState(game);
		}, 1000 / 60);
	}

	endGame(gameIndex: number) {
		const game = this.currentGame[gameIndex];
		this.server.to(game.playersIds.map((id) => id.toString())).emit('pong/gameEnded', game);
		if (game.gameInterval) {
			clearInterval(game.gameInterval);
		}
		this.currentGame.splice(gameIndex, 1);
	}

	updatePaddleState(game: GameState) {
		for (const player of [game.player1, game.player2]) {
			if (player.paddleDirection === 'up') {
				player.paddleY = Math.max(player.paddleY - player.paddleSpeed, 0);
			} else if (player.paddleDirection === 'down') {
				player.paddleY = Math.min(player.paddleY + player.paddleSpeed, CANVAS_HEIGHT - player.paddleHeight);
			}
		}
	}

	UpdateBallState(game: GameState) {
		// ball movement
		game.ball.x += game.ball.dx;
		game.ball.y += game.ball.dy;
		game.ball.ax = 0;
		game.ball.ay = 0;

		// horizontal
		if (game.ball.x > CANVAS_WIDTH || game.ball.x < 0) {
			const oldDx = game.ball.dx;
			// right side collision
			if (game.ball.x > CANVAS_WIDTH / 2 && game.ball.y >= game.player2.paddleY && game.ball.y <= game.player2.paddleY + game.player2.paddleHeight) {
				game.ball.dx = -game.ball.dx;
				const deltaY = game.ball.y - (game.player2.paddleY + game.player2.paddleHeight / 2);
				game.ball.dy = deltaY * 0.35;
				game.ball.ax = (game.ball.dx - oldDx) / (1 / 60);
			}
			// left side collision
			else if (game.ball.x < CANVAS_WIDTH / 2 && game.ball.y >= game.player1.paddleY && game.ball.y <= game.player1.paddleY + game.player1.paddleHeight) {
				game.ball.dx = -game.ball.dx;
				const deltaY = game.ball.y - (game.player1.paddleY + game.player1.paddleHeight / 2);
				game.ball.dy = deltaY * 0.35;
			} else {
				if (game.ball.x < CANVAS_WIDTH / 2) {
					game.player2.score++;
				} else {
					game.player1.score++;
				}
				game.resetBall();
			}
		}

		// vertical
		if (game.ball.y > CANVAS_HEIGHT || game.ball.y < 0) {
			const oldDy = game.ball.dy;
			game.ball.dy = -game.ball.dy;
			game.ball.ay = (game.ball.dy - oldDy) / (1 / 60);
		}
	}
}
