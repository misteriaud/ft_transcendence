//pong.gateway.ts
import { WsException } from '@nestjs/websockets';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { BaseWebsocketGateway } from 'src/utils/websocket.utils';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { SubscribeMessage } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { nanoid } from 'nanoid';
import { PrismaMatchService } from './prismaMatch.service';
import { e_match_state } from '@prisma/client';

const CANVAS_HEIGHT = 450;
const CANVAS_WIDTH = 800;
const TIME_DIVISION = 10;

enum GameMode {
	NORMAL = 0,
	HARDCORE = 1,
}

enum GameStatus {
	PREPARATION,
	INPROGRESS,
	FINISHED = 'FINISHED',
	ABANDONED = 'ABANDONED',
}

type Invitation = {
	id: string;
	player1id: number;
	player2id: number;
	mode: GameMode;
};

class Player {
	paddleY: number;
	score: number;
	paddleSpeed: number;
	paddleDirection: 'up' | 'down' | 'stop';
	paddleHeight: number;
	ready: boolean;
}

class GameState {
	id: string;
	mode: GameMode;
	ball: { x: number; y: number; dx: number; dy: number };
	players: Map<number, Player> = new Map();
	readonly playerIds: string[];
	paddleWidth: number;
	ballRadius: number;
	gameInterval: NodeJS.Timeout | null;
	dt: number;
	expiration: Date;
	status: GameStatus = GameStatus.PREPARATION;

	constructor(mode: GameMode, player1id: number, player2id: number, private emitGameState: (path: 'gameState' | 'gameEnded', state: GameState) => void) {
		this.id = nanoid();
		this.mode = mode;
		this.ball = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: CANVAS_HEIGHT / 2, dy: 0 };
		this.players.set(player1id, { paddleY: CANVAS_HEIGHT / 3, score: 0, paddleDirection: 'stop', paddleSpeed: 300, paddleHeight: 80, ready: false });
		this.players.set(player2id, { paddleY: CANVAS_HEIGHT / 3, score: 0, paddleDirection: 'stop', paddleSpeed: 300, paddleHeight: 80, ready: false });
		this.playerIds = [String(player1id), String(player2id)];
		this.paddleWidth = 10;
		this.ballRadius = 6;
		this.gameInterval = null;
		this.dt = Date.now();
	}

	resetBall() {
		this.ball.x = CANVAS_WIDTH / 2;
		this.ball.y = CANVAS_HEIGHT / 2;
		this.ball.dx = CANVAS_HEIGHT / 2;
		this.ball.dy = 0;
		return this.ball;
	}

	setPlayerReady(userId: number, state: boolean) {
		if (!this.players.get(userId)) return;
		this.players.get(userId).ready = state;

		if (this.status === GameStatus.PREPARATION && Array.from(this.players.values()).every((player) => player.ready)) {
			this.startGame();
		}
		if (this.status === GameStatus.INPROGRESS && Array.from(this.players.values()).every((player) => !player.ready)) {
			this.endGame(GameStatus.ABANDONED);
		}
	}

	//@SubscribeMessage('pong/movePaddle')
	movePaddle(userId: number, direction: 'up' | 'down' | 'stop') {
		if (this.status !== GameStatus.INPROGRESS) return;
		if (!this.players.get(userId)) return;
		this.players.get(userId).paddleDirection = direction;
	}

	startGame() {
		this.gameInterval = setInterval(() => {
			this.dt = Date.now();
			const deltaTime = this.dt - this.dt;
			this.UpdateBallState(deltaTime / 1000);
			this.updatePaddleState(deltaTime / 1000);

			const playerIter = this.players.values();

			if (playerIter.next().value().score >= 11 || playerIter.next().value().score >= 11) {
				return this.endGame(GameStatus.FINISHED);
			}

			this.emitGameState('gameState', this);
		}, 1000 / TIME_DIVISION);
	}

	endGame(status: GameStatus) {
		this.status = status;
		if (this.gameInterval) {
			clearInterval(this.gameInterval);
		}
		this.emitGameState('gameEnded', this);
	}

	updatePaddleState(deltaTime: number) {
		this.players.forEach((player: Player) => {
			if (player.paddleDirection === 'up') {
				player.paddleY = Math.max(player.paddleY - player.paddleSpeed * deltaTime, 0);
			} else if (player.paddleDirection === 'down') {
				player.paddleY = Math.min(player.paddleY + player.paddleSpeed * deltaTime, CANVAS_HEIGHT - player.paddleHeight);
			}
		});
	}

	UpdateBallState(deltaTime: number) {
		// ball movement
		this.ball.x += this.ball.dx * deltaTime;
		this.ball.y += this.ball.dy * deltaTime;

		const playerIter = this.players.entries();
		const player1 = playerIter.next().value();
		const player2 = playerIter.next().value();

		// horizontal
		if (this.ball.x > CANVAS_WIDTH || this.ball.x < 0) {
			// right side collision
			if (this.ball.x > CANVAS_WIDTH / 2 && this.ball.y >= player2.paddleY && this.ball.y <= player2.paddleY + player2.paddleHeight) {
				this.ball.dx = -this.ball.dx;
				const deltaY = this.ball.y - (player2.paddleY + player2.paddleHeight / 2);
				this.ball.dy = deltaY * 0.35;
			}
			// left side collision
			else if (this.ball.x < CANVAS_WIDTH / 2 && this.ball.y >= player1.paddleY && this.ball.y <= player1.paddleY + player1.paddleHeight) {
				this.ball.dx = -this.ball.dx;
				const deltaY = this.ball.y - (player1.paddleY + player1.paddleHeight / 2);
				this.ball.dy = deltaY * 0.35;
			} else {
				if (this.ball.x < CANVAS_WIDTH / 2) {
					player2.score++;
				} else {
					player1.score++;
				}
				this.resetBall();
			}
		}

		// vertical
		if (this.ball.y > CANVAS_HEIGHT || this.ball.y < 0) {
			this.ball.dy = -this.ball.dy;
		}
	}
}

export class PongWebsocketGateway extends BaseWebsocketGateway {
	currentGame: GameState[] = [];
	waitingInvitation: Invitation[] = [];
	waitingPlayer: number[];

	constructor(jwtService: JwtService, userService: UserService, private prismaMatch: PrismaMatchService) {
		super(jwtService, userService);
	}

	async handleConnection(client: Socket) {
		await super.handleConnection(client);
		this.currentGame.forEach((game: GameState, index: number) => {
			if (game.players.has(client.data.user.id)) {
				client.data.gameIndex = index;
			}
		});
	}

	@SubscribeMessage('pong/invite')
	handlePongInvite(client: Socket, { player2Id, mode }: { player2Id?: number; mode: GameMode }) {
		const invitation = {
			id: nanoid(),
			player1id: client.data.user.id,
			player2id: player2Id,
			mode: mode,
		};
		if (player2Id) {
			const index = this.waitingInvitation.findIndex((invitation) => invitation.player1id === player2Id && invitation.player2id === client.data.user.id);
			if (index !== -1) {
				this.createGame(this.waitingInvitation[index].mode, this.waitingInvitation[index].player1id, this.waitingInvitation[index].player2id);
				this.waitingInvitation.splice(index);
			} else {
				this.waitingInvitation.push(invitation);
				this.server.to(player2Id.toString()).emit('pong/invitation', invitation);
			}
		} else {
			// if already someone in queue
			if (this.waitingPlayer[mode]) {
				this.createGame(mode, this.waitingPlayer[mode], client.data.user.id);
			} else {
				this.waitingPlayer[mode] = client.data.user.id;
			}
		}
	}

	@SubscribeMessage('pong/cancelInvite')
	handlePongCancelInvite(client: Socket, invitationId: string) {
		const index = this.waitingInvitation.findIndex((invitation) => invitation.id === invitationId);
		if (index !== -1) {
			this.waitingInvitation.splice(index);
		}
	}

	@SubscribeMessage('pong/acceptInvite')
	handlePongAcceptInvite(client: Socket, invitationId: string) {
		const index = this.waitingInvitation.findIndex((invitation) => invitation.id === invitationId);
		if (index !== -1) {
			this.createGame(this.waitingInvitation[index].mode, this.waitingInvitation[index].player1id, this.waitingInvitation[index].player2id);
			this.waitingInvitation.splice(index);
		}
	}

	createGame(mode: GameMode, player1id: number, player2id: number) {
		const newGame = new GameState(mode, player1id, player2id, this.sendGameState);
		this.currentGame.push(newGame);
		this.server.to([player1id, player2id].map((id) => id.toString())).emit('pong/newGame', { gameId: newGame.id, gameState: newGame });
	}

	@UsePipes(new ValidationPipe())
	@SubscribeMessage('pong/ready')
	handlePongReady(client: Socket, gameId: string) {
		console.log('Player ready');
		const gameIndex = this.currentGame.findIndex((game) => game.id === gameId);

		if (client.data.gameIndex && client.data.gameIndex !== gameIndex) {
			console.log('User already playing another game');
			return;
		}
		if (gameIndex === -1) {
			console.log("Game doesn't exist");
			return;
		}
		const game = this.currentGame[gameIndex];
		if (!game.players.has(client.data.user.id)) {
			console.log('User is not player in this game');
			return;
		}

		client.data.gameIndex = gameIndex;
		game.setPlayerReady(client.data.user.id, true);
	}

	// @SubscribeMessage('pong/sendGameState')
	sendGameState(path: 'gameState' | 'gameEnded', currentGame: GameState) {
		this.server.to(currentGame.playerIds).emit('pong/gameState', currentGame);
		if (path === 'gameEnded') {
			const index = this.currentGame.findIndex((game) => game.id === currentGame.id);
			const playerIter = currentGame.players.values();
			const player1 = playerIter.next().value();
			const player2 = playerIter.next().value();

			this.prismaMatch.create(player1.id, player2.id, player1.score, player2.score, currentGame.mode === GameMode.NORMAL ? 'NORMAL' : 'HARDCORE', currentGame.status as e_match_state);
			this.currentGame.splice(index, 1);
		} else {
		}
	}

	@UsePipes(new ValidationPipe())
	async handleDisconnect(client: Socket) {
		await super.handleDisconnect(client);
		const gameIndex = client.data.gameIndex;

		if (!gameIndex) {
			console.log('No game found for this player');
			return;
		}

		const game = this.currentGame[gameIndex];
		game.setPlayerReady(client.data.user.id, false);
	}
}
