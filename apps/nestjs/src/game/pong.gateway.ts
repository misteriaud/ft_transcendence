import { WsException } from '@nestjs/websockets';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { BaseWebsocketGateway } from 'src/utils/websocket.utils';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { SubscribeMessage } from '@nestjs/websockets';
import { Socket } from 'socket.io';

const CANVAS_HEIGHT = 450;
const CANVAS_WIDTH = 800;

class GameState {
	ball: { x: number; y: number; dx: number; dy: number };
	player1: { paddleY: number; score: number };
	player2: { paddleY: number; score: number };
	paddleHeight: number;
	paddleWidth: number;
	ballRadius: number;
	playersIds: number[];
	playersReady: boolean[];
	gameInterval: NodeJS.Timeout | null;

	constructor() {
		this.ball = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: CANVAS_HEIGHT / 75, dy: 0 };
		this.player1 = { paddleY: CANVAS_HEIGHT / 2, score: 0 };
		this.player2 = { paddleY: CANVAS_HEIGHT / 2, score: 0 };
		this.paddleHeight = 80;
		this.paddleWidth = 10;
		this.ballRadius = 6;
		this.playersIds = [];
		this.playersReady = [false, false];
		this.gameInterval = null;
	}

	resetBall() {
		this.ball.x = CANVAS_WIDTH / 2;
		this.ball.y = CANVAS_HEIGHT / 2;
		this.ball.dx = CANVAS_HEIGHT / 75;
		this.ball.dy = 0;
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
		//this.sendGameState(this.currentGame[client.data.gameIndex]);
	}

	@SubscribeMessage('pong/movePaddle')
	handlePaddleMove(client: Socket, direction: 'up' | 'down' | 'stop') {
		const paddleSpeed = 6;
		const currentGame = this.currentGame[client.data.gameIndex];

		if (!currentGame || !currentGame.playersReady.every(Boolean)) {
			console.log('Not all players are ready or game does not exist');
			return;
		}

		const currentPlayer = currentGame[`player${client.data.playerIndex + 1}`];

		if (!currentPlayer) {
			console.log('Player does not exist');
			return;
		}

		if (direction === 'up' && currentPlayer.paddleY - paddleSpeed > 0) {
			currentPlayer.paddleY -= paddleSpeed;
		} else if (direction === 'down' && currentPlayer.paddleY + paddleSpeed < CANVAS_HEIGHT - currentGame.paddleHeight) {
			currentPlayer.paddleY += paddleSpeed;
		} else if (direction === 'stop') {
			currentPlayer.paddleY = currentPlayer.paddleY;
		}
		//this.sendGameState(currentGame);
	}

	@SubscribeMessage('pong/stop')
	sendGameState(currentGame: GameState) {
		this.server.to(currentGame.playersIds.map((id) => id.toString())).emit('pong/gameState', currentGame);
		//console.log(currentGame);
	}

	@UsePipes(new ValidationPipe())
	async handleDisconnect(client: Socket) {
		if (client.data && client.data.user) {
			const gameIndex = this.currentGame.findIndex((game) => game.playersIds.includes(client.data.user.id));
			if (gameIndex !== -1) {
				this.currentGame[gameIndex].playersReady[client.data.playerIndex] = false;
				this.currentGame[gameIndex].playersIds = this.currentGame[gameIndex].playersIds.filter((id) => id !== client.data.user.id);

				if (this.currentGame[gameIndex].playersIds.length === 0) {
					this.currentGame.splice(gameIndex, 1);
				}
			}
		}
		super.handleDisconnect(client);
	}

	startGame(gameIndex: number) {
		this.currentGame[gameIndex].gameInterval = setInterval(() => {
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
		if (game.gameInterval) {
			clearInterval(game.gameInterval);
		}
		this.currentGame.splice(gameIndex, 1);
	}

	updateGameState(game: GameState) {
		// ball movement
		game.ball.x += game.ball.dx;
		game.ball.y += game.ball.dy;

		// horizontal
		if (game.ball.x > CANVAS_WIDTH || game.ball.x < 0) {
			// right side collision
			if (game.ball.x > CANVAS_WIDTH / 2 && game.ball.y >= game.player2.paddleY && game.ball.y <= game.player2.paddleY + game.paddleHeight) {
				game.ball.dx = -game.ball.dx;
				const deltaY = game.ball.y - (game.player2.paddleY + game.paddleHeight / 2);
				game.ball.dy = deltaY * 0.35;
			}
			// left side collision
			else if (game.ball.x < CANVAS_WIDTH / 2 && game.ball.y >= game.player1.paddleY && game.ball.y <= game.player1.paddleY + game.paddleHeight) {
				game.ball.dx = -game.ball.dx;
				const deltaY = game.ball.y - (game.player1.paddleY + game.paddleHeight / 2);
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
			game.ball.dy = -game.ball.dy;
		}
		this.sendGameState(game);
	}
}

//	switch to an event driven approach
//	use vectors instead of dx and dy
//	send clientside inputs to calculate paddle vectors and ball vector
//	debounce

//	https://www.youtube.com/watch?v=KoWqdEACyLI
