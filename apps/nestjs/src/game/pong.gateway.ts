import { WsException, SubscribeMessage } from '@nestjs/websockets';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { BaseWebsocketGateway } from 'src/utils/websocket.utils';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { Socket } from 'socket.io';

const CANVAS_HEIGHT = 450;
const CANVAS_WIDTH = 800;

class Vector {
	constructor(public dx: number, public dy: number) {}
}

class Ball {
	public vector: Vector;

	constructor(public x: number, public y: number, angle: number, magnitude: number, public paddleWidth: number) {
		this.vector = new Vector(Math.cos(angle) * magnitude, Math.sin(angle) * magnitude);
	}
}

class Player {
	public direction: 'up' | 'down' | 'stop' = 'stop';

	constructor(public paddleY: number, public score: number, public paddleSpeed: number, public paddleHeight: number, public paddleWidth: number) {}
}

class GameState {
	paddleHeight = 80;
	paddleWidth = 10;
	ballRadius = 6;

	ball: Ball;
	player1: Player;
	player2: Player;
	playersIds: number[];
	playersReady: boolean[];
	gameInterval: NodeJS.Timeout | null;

	constructor() {
		this.ball = new Ball(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, Math.PI / 4, CANVAS_HEIGHT / 75, this.paddleWidth);
		this.player1 = new Player(CANVAS_HEIGHT / 2, 0, CANVAS_HEIGHT / 75, this.paddleHeight, this.paddleWidth);
		this.player2 = new Player(CANVAS_HEIGHT / 2, 0, CANVAS_HEIGHT / 75, this.paddleHeight, this.paddleWidth);
		this.playersIds = [];
		this.playersReady = [false, false];
		this.gameInterval = null;
	}

	resetBall() {
		this.ball = new Ball(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, Math.PI / 4, CANVAS_HEIGHT / 75, this.paddleWidth);
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
		const gameIndex = this.currentGame.findIndex((game) => game.playersIds.length < 2);

		if (gameIndex !== -1 && this.currentGame[gameIndex].playersIds.includes(client.data.user.id)) {
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

	@SubscribeMessage('pong/movePaddle')
	handlePaddleMove(client: Socket, direction: 'up' | 'down' | 'stop') {
		const gameIndex = client.data.gameIndex;
		const currentGame = this.currentGame[gameIndex];

		if (!currentGame || !currentGame.playersReady.every(Boolean)) {
			console.log('Not all players are ready or game does not exist');
			return;
		}

		const currentPlayer = currentGame[`player${client.data.playerIndex + 1}`] as Player;

		if (!currentPlayer) {
			console.log('Player does not exist');
			return;
		}

		currentPlayer.direction = direction;
	}

	@SubscribeMessage('pong/stop')
	sendGameState(currentGame: GameState) {
		this.server.to(currentGame.playersIds.map((id) => id.toString())).emit('pong/gameState', currentGame);
	}

	@UsePipes(new ValidationPipe())
	async handleDisconnect(client: Socket) {
		const gameIndex = client.data.gameIndex;
		if (gameIndex !== undefined && gameIndex !== -1) {
			this.endGame(gameIndex);
		} else {
			console.log('Client disconnected but was not in a game.');
		}
	}

	startGame(gameIndex: number) {
		this.currentGame[gameIndex].gameInterval = setInterval(() => {
			const game = this.currentGame[gameIndex];
			if (game.playersReady.every(Boolean)) {
				this.updateGameState(game);
			}
			if (game.player1.score >= 11 || game.player2.score >= 11) {
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

	movePlayerPaddle(player: Player) {
		switch (player.direction) {
			case 'up':
				player.paddleY = Math.max(player.paddleY - player.paddleSpeed, 0);
				break;
			case 'down':
				player.paddleY = Math.min(player.paddleY + player.paddleSpeed, CANVAS_HEIGHT - player.paddleHeight);
				break;
		}
	}

	moveBall(game: GameState) {
		game.ball.x += game.ball.vector.dx;
		game.ball.y += game.ball.vector.dy;

		if (game.ball.y - game.ballRadius < 0 || game.ball.y + game.ballRadius > CANVAS_HEIGHT) {
			game.ball.vector.dy *= -1;
		}
	}

	detectCollisions(game: GameState) {
		if (this.ballHitPaddle(game.ball, game.player1)) {
			game.ball.vector.dx *= -1;
			game.ball.vector.dy = ((game.ball.y - (game.player1.paddleY + game.player1.paddleHeight / 2)) / game.player1.paddleHeight) * 2;
		} else if (this.ballHitPaddle(game.ball, game.player2)) {
			game.ball.vector.dx *= -1;
			game.ball.vector.dy = ((game.ball.y - (game.player2.paddleY + game.player2.paddleHeight / 2)) / game.player2.paddleHeight) * 2;
		}

		if (game.ball.x - game.ballRadius < 0) {
			game.player2.score++;
			game.ball = game.resetBall();
		} else if (game.ball.x + game.ballRadius > CANVAS_WIDTH) {
			game.player1.score++;
			game.ball = game.resetBall();
		}
	}

	ballHitPaddle(ball: Ball, player: Player) {
		return ball.y + ball.paddleWidth > player.paddleY && ball.y - ball.paddleWidth < player.paddleY + player.paddleHeight;
	}

	updateGameState(game: GameState) {
		this.movePlayerPaddle(game.player1);
		this.movePlayerPaddle(game.player2);
		this.moveBall(game);
		this.detectCollisions(game);
		this.sendGameState(game);
	}
}
