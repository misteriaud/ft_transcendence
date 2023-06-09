//pong.gateway.ts
import { WebSocketGateway } from '@nestjs/websockets';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { BaseWebsocketGateway } from 'src/utils/websocket.utils';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { SubscribeMessage } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { nanoid } from 'nanoid';
import { PrismaMatchService } from './prismaMatch.service';
import { e_match_state, e_user_status } from '@prisma/client';

const CANVAS_HEIGHT = 450;
const CANVAS_WIDTH = 800;
const TIME_DIVISION = 20;

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
	id: number;
	stringId: string;
	paddleY: number;
	score: number;
	paddleSpeed: number;
	paddleDirection: 'up' | 'down' | 'stop';
	paddleHeight: number;
	ready: boolean;
}

class Wall {
	x: number;
	y: number;
	width: number;
	height: number;
}
const resetOffset = 50;

class GameState {
	id: string;
	mode: GameMode;
	ball: { x: number; y: number; dx: number; dy: number } = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: 0, dy: 0 };
	players: Player[] = new Array(2);
	paddleWidth: number;
	ballRadius: number;
	gameInterval: NodeJS.Timeout | null;
	dt: number;
	expiration: Date;
	status: GameStatus = GameStatus.PREPARATION;
	wall: Wall | null = null;

	constructor(mode: GameMode, player1id: number, player2id: number) {
		this.id = nanoid();
		this.mode = mode;
		this.ball = { x: CANVAS_WIDTH / 2 + resetOffset, y: CANVAS_HEIGHT / 2, dx: CANVAS_HEIGHT / 2, dy: 0 };
		this.players[0] = { id: Number(player1id), stringId: player1id.toString(), paddleY: (CANVAS_HEIGHT - 90) / 2, score: 0, paddleDirection: 'stop', paddleSpeed: 300, paddleHeight: 90, ready: false };
		this.players[1] = { id: Number(player2id), stringId: player2id.toString(), paddleY: (CANVAS_HEIGHT - 90) / 2, score: 0, paddleDirection: 'stop', paddleSpeed: 300, paddleHeight: 90, ready: false };
		this.paddleWidth = 10;
		this.ballRadius = 6;
		this.gameInterval = null;
		this.dt = 0;
		if (this.mode === GameMode.HARDCORE) {
			this.wall = { x: CANVAS_WIDTH / 2, y: (CANVAS_HEIGHT - CANVAS_HEIGHT / 3) / 2, width: 10, height: CANVAS_HEIGHT / 3 };
		}
	}

	resetBall(direction: number, x: number) {
		this.ball.x = x;
		this.ball.y = CANVAS_HEIGHT / 2;
		this.ball.dx = direction;
		this.ball.dy = 0;
		return this.ball;
	}

	playerExist(userId: number) {
		return this.players.some((player) => player.id === userId);
	}

	allReady() {
		return this.players.every((player: Player) => player.ready);
	}

	movePaddle(userId: number, direction: 'up' | 'down' | 'stop') {
		if (this.status !== GameStatus.INPROGRESS) return;
		const index = this.players.findIndex((player) => player.id === userId);
		if (index === -1) return;
		this.players[index].paddleDirection = direction;
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
		//variables
		const maxSpeed = 400;
		const speedFactor = 1.05;
		const angleFactor = 4;
		const hardcoreDecreaseAmount = 5;
		const leftBounds = 27;
		const rightBounds = CANVAS_WIDTH - 27;
		const bottomBounds = CANVAS_HEIGHT - 8;
		const topBounds = 8;
		const player1 = this.players[0];
		const player2 = this.players[1];

		// ball movement
		this.ball.x += this.ball.dx * deltaTime;
		this.ball.y += this.ball.dy * deltaTime;

		// collision with wall
		if (this.ball.x + this.ballRadius > this.wall?.x && this.ball.x - this.ballRadius < this.wall?.x + this.wall?.width && this.ball.y + this.ballRadius > this.wall?.y && this.ball.y - this.ballRadius < this.wall?.y + this.wall?.height) {
			this.ball.dx = -this.ball.dx;
		}

		// horizontal
		if (this.ball.x > rightBounds || this.ball.x < leftBounds) {
			// right side collision
			if (this.ball.x > CANVAS_WIDTH / 2 && this.ball.y >= player2.paddleY && this.ball.y <= player2.paddleY + player2.paddleHeight) {
				this.ball.dx = -this.ball.dx * speedFactor;
				if (Math.abs(this.ball.dx) > maxSpeed) {
					this.ball.dx = this.ball.dx > 0 ? maxSpeed : -maxSpeed;
				}
				const deltaY = this.ball.y - (player2.paddleY + player2.paddleHeight / 2);
				this.ball.dy = deltaY * angleFactor + Math.random() - 0.5;
			}
			// left side collision
			else if (this.ball.x < CANVAS_WIDTH / 2 && this.ball.y >= player1.paddleY && this.ball.y <= player1.paddleY + player1.paddleHeight) {
				this.ball.dx = -this.ball.dx * speedFactor;
				if (Math.abs(this.ball.dx) > maxSpeed) {
					this.ball.dx = this.ball.dx > 0 ? maxSpeed : -maxSpeed;
				}
				const deltaY = this.ball.y - (player1.paddleY + player1.paddleHeight / 2);
				this.ball.dy = deltaY * angleFactor + Math.random() - 0.5;
			} else {
				if (this.ball.x < CANVAS_WIDTH / 2) {
					if (this.mode === GameMode.HARDCORE) {
						player2.paddleHeight -= hardcoreDecreaseAmount;
						player2.paddleY += hardcoreDecreaseAmount / 2;
					}
					player2.score++;
					this.resetBall(-CANVAS_HEIGHT / 2, CANVAS_WIDTH / 2 - resetOffset);
				} else {
					if (this.mode === GameMode.HARDCORE) {
						player1.paddleHeight -= hardcoreDecreaseAmount;
						player1.paddleY += hardcoreDecreaseAmount / 2;
					}
					player1.score++;
					this.resetBall(CANVAS_HEIGHT / 2, CANVAS_WIDTH / 2 + resetOffset);
				}
			}
		}

		// vertical
		if (this.ball.y > bottomBounds || this.ball.y < topBounds) {
			this.ball.dy = -this.ball.dy;
			if (Math.abs(this.ball.dx) > maxSpeed) {
				this.ball.dy = this.ball.dy > 0 ? maxSpeed : -maxSpeed;
			}
		}
	}
}

@WebSocketGateway()
export class PongWebsocketGateway extends BaseWebsocketGateway {
	currentGame: GameState[] = [];
	waitingInvitation: Invitation[] = [];
	waitingPlayer: Array<number | null> = [null, null];

	constructor(jwtService: JwtService, userService: UserService, private prismaMatch: PrismaMatchService) {
		super(jwtService, userService);
	}

	/**
	 * CONNECTIONS AND DISCONNECTIONS
	 */

	async handleConnection(client: Socket) {
		await super.handleConnection(client);
		// this.currentGame.forEach((game: GameState, index) => {
		// 	if (game.players.some((player) => player.id === client.data.user.id)) {
		// 		this.setPlayerReady(game, client.data.user.id, true);
		// 		this.handlePongReady(client, { gameId: game.id, isReady: true });
		// 		// client.join(`pong:${game.id}`);
		// 		// client.data.gameIndex = index;
		// 	}
		// });
	}

	@UsePipes(new ValidationPipe())
	async handleDisconnect(client: Socket) {
		await super.handleDisconnect(client);

		this.cleanInvitation(client.data.user?.id);

		const gameIndex = client.data.gameIndex;
		if (gameIndex === undefined) {
			console.log('No game found for this player');
			return;
		}

		const game = this.currentGame[gameIndex];
		if (game) this.setPlayerReady(game, client.data.user.id, false);
	}

	cleanInvitation(userId: number) {
		this.waitingInvitation.forEach((invitation: Invitation, index: number) => {
			if (invitation.player1id === userId || invitation.player2id === userId) {
				this.server.to([invitation.player1id.toString(), invitation.player2id.toString()]).emit('pong/invitationCanceled', invitation);
				this.waitingInvitation.splice(index);
			}
		});
		this.cleanQueueInvitation(userId);
	}

	cleanQueueInvitation(userId: number) {
		if (this.waitingPlayer[0] === userId) this.waitingPlayer[0] = null;
		if (this.waitingPlayer[1] === userId) this.waitingPlayer[1] = null;
	}

	/**
	 * INVITATIONS
	 */

	@SubscribeMessage('pong/invite')
	handlePongInvite(client: Socket, { player2id, mode }: { player2id?: number; mode: GameMode }) {
		if (player2id) {
			const index = this.waitingInvitation.findIndex((invitation) => invitation.player1id === player2id && invitation.player2id === client.data.user.id);
			// if (index !== -1) {
			// 	this.createGame(this.waitingInvitation[index].mode, this.waitingInvitation[index].player1id, this.waitingInvitation[index].player2id);
			// 	this.waitingInvitation.splice(index);
			// }
			// si aucune invitation inverse existe
			if (index === -1) {
				const invitation = {
					id: nanoid(),
					player1id: client.data.user.id,
					player2id: player2id,
					mode: mode,
				};
				this.waitingInvitation.push(invitation);
				this.server.to(player2id.toString()).emit('pong/invitation', invitation);
				return invitation.id;
			}
			// si une invitation inverse existe deja
			else {
				this.handlePongAcceptInvite(client, this.waitingInvitation[index].id);
			}
		} else {
			console.log('invite random');
			// if already someone in queue
			if (this.waitingPlayer[mode]) {
				console.log('already someone in queue');
				this.createGame(mode, this.waitingPlayer[mode], client.data.user.id);
				this.waitingPlayer[mode] = null;
			} else {
				console.log('nobody in queue');
				this.waitingPlayer[mode] = client.data.user.id;
			}
		}
	}

	@SubscribeMessage('pong/acceptInvite')
	handlePongAcceptInvite(client: Socket, invitationId: string) {
		const index = this.waitingInvitation.findIndex((invitation) => invitation.id === invitationId);
		if (index === -1) return;
		const invitation = this.waitingInvitation[index];
		this.createGame(invitation.mode, invitation.player1id, invitation.player2id);
		this.waitingInvitation.splice(index);
		this.cleanQueueInvitation(invitation.player1id);
		this.cleanQueueInvitation(invitation.player2id);
	}

	@SubscribeMessage('pong/cancelInvite')
	handlePongCancelInvite(client: Socket, invitationId?: string) {
		if (!invitationId) return this.cleanQueueInvitation(client.data.user.id);
		const index = this.waitingInvitation.findIndex((invitation) => invitation.id === invitationId);
		if (index === -1) return;
		const invitation = this.waitingInvitation[index];
		this.server.to([invitation.player1id.toString(), invitation.player2id.toString()]).emit('pong/invitationCanceled', invitation);
		this.waitingInvitation.splice(index);
	}

	/**
	 * SETTING UP GAME
	 */

	createGame(mode: GameMode, player1id: number, player2id: number) {
		// TOCHECK
		if (player1id === player2id) return;
		const newGame = new GameState(mode, player1id, player2id);
		this.currentGame.push(newGame);
		this.server.to([player1id.toString(), player2id.toString()]).emit('pong/newGame', newGame.id);
	}

	@UsePipes(new ValidationPipe())
	@SubscribeMessage('pong/ready')
	handlePongReady(client: Socket, { gameId, isReady }: { gameId: string; isReady: boolean }) {
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
		if (!game.players.some((player) => player.id === client.data.user.id)) {
			console.log('User is not player in this game');
			return;
		}

		if (isReady) {
			client.data.gameIndex = gameIndex;
			client.join(`pong:${game.id}`);
		}
		this.setPlayerReady(game, client.data.user.id, isReady);
	}

	setPlayerReady(game: GameState, userId: number, state: boolean) {
		const index = game.players.findIndex((player) => player.id === userId);
		if (index === -1) return;
		game.players[index].ready = state;

		console.log(game.status, `is ready: ${state}`);
		if (game.status === GameStatus.INPROGRESS) {
			this.updateUserStatus(userId, state ? e_user_status.INGAME : e_user_status.ONLINE);
		}
		if (game.status === GameStatus.PREPARATION && game.allReady()) {
			console.log('start game');
			this.startGame(game);
		}
		if (!state && game.status === GameStatus.INPROGRESS && game.players.every((player: Player) => !player.ready)) {
			this.endGame(game, GameStatus.ABANDONED);
		}
	}

	/**
	 * GAME ROUTINE
	 */

	startGame(game: GameState) {
		game.dt = Date.now();
		game.gameInterval = setInterval(() => {
			const now = Date.now();
			const deltaTime = (now - game.dt) / 1000;
			game.dt = now;
			game.UpdateBallState(deltaTime);
			game.updatePaddleState(deltaTime);
			if (game.players.some((player: Player) => player.score >= 10)) {
				return this.endGame(game, GameStatus.FINISHED);
			}
			this.server.to(`pong:${game.id}`).emit('pong/gameState', game);
		}, 1000 / TIME_DIVISION);
		game.status = GameStatus.INPROGRESS;
		this.updateUserStatus(game.players[0].id, e_user_status.INGAME);
		this.updateUserStatus(game.players[1].id, e_user_status.INGAME);
	}

	async endGame(game: GameState, status: GameStatus) {
		if (game.gameInterval) {
			clearInterval(game.gameInterval);
		}
		this.server.to(`pong:${game.id}`).emit(`pong/${status == GameStatus.FINISHED ? 'gameEnded' : 'gameAbandoned'}`, game);
		try {
			await this.prismaMatch.create(game.id, game.players[0].id, game.players[1].id, game.players[0].score, game.players[1].score, game.mode === GameMode.NORMAL ? 'NORMAL' : 'HARDCORE', status as e_match_state);
		} catch (error) {}
		const index = this.currentGame.findIndex((tmp) => tmp.id === game.id);
		this.currentGame.splice(index, 1);
		this.updateUserStatus(game.players[0].id, e_user_status.ONLINE);
		this.updateUserStatus(game.players[1].id, e_user_status.ONLINE);
	}

	@SubscribeMessage('pong/movePaddle')
	movePaddle(client: Socket, direction: 'up' | 'down' | 'stop') {
		const game = this.currentGame[client.data.gameIndex];
		game.movePaddle(client.data.user.id, direction);
	}
}
