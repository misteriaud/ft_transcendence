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

type Invitation = {
	id: string;
	player1id: number;
	player2id: number;
	mode: 'HARDCORE' | 'NORMAL';
};

class Player {
	paddleY: number;
	score: number;
	paddleSpeed: number;
	paddleDirection: 'up' | 'down' | 'stop';
	paddleHeight: number;
}

class GameState {
	id: string;
	mode: 'HARDCORE' | 'NORMAL';
	ball: { x: number; y: number; dx: number; dy: number };
	player1: Player;
	player2: Player;
	paddleWidth: number;
	ballRadius: number;
	playersIds: number[];
	playersReady: boolean[];
	gameInterval: NodeJS.Timeout | null;
	timestamp: number;
	expiration: Date;

	constructor(mode: 'HARDCORE' | 'NORMAL') {
		this.id = nanoid();
		this.mode = mode;
		this.ball = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: CANVAS_HEIGHT / 2, dy: 0 };
		this.player1 = { paddleY: CANVAS_HEIGHT / 2, score: 0, paddleDirection: 'stop', paddleSpeed: 300, paddleHeight: 80 };
		this.player2 = { paddleY: CANVAS_HEIGHT / 2, score: 0, paddleDirection: 'stop', paddleSpeed: 300, paddleHeight: 80 };
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
		this.ball.dx = CANVAS_HEIGHT / 2;
		this.ball.dy = 0;
		return this.ball;
	}
}

export class PongWebsocketGateway extends BaseWebsocketGateway {
	currentGame: GameState[] = [];
	waitingInvitation: Invitation[] = [];
	waitingNormalInvitation: Invitation[] = [];
	waitingHardcoreInvitation: Invitation[] = [];

	constructor(jwtService: JwtService, userService: UserService, private prismaMatch: PrismaMatchService) {
		super(jwtService, userService);
	}

	@SubscribeMessage('pong/invite')
	handlePongInvite(client: Socket, { player2Id, mode }: { player2Id?: number; mode: 'HARDCORE' | 'NORMAL' }) {
		const invitation = {
			id: nanoid(),
			player1id: client.data.user.id,
			player2id: player2Id,
			mode: mode,
		};
		if (player2Id === undefined) {
			if (mode === 'HARDCORE') this.waitingHardcoreInvitation.push(invitation);
			else this.waitingNormalInvitation.push(invitation);
		} else {
			this.waitingInvitation.push(invitation);
			this.server.to(player2Id.toString()).emit('pong/invitation', invitation);
		}
	}

	@SubscribeMessage('pong/acceptInvite')
	handlePongAcceptInvite(client: Socket, { invitationId, mode }: { invitationId?: string; mode: 'HARDCORE' | 'NORMAL' }) {
		let invitationIndex: number;
		let invitation: Invitation;

		if (invitationId === undefined) {
			const invitationList = mode === 'HARDCORE' ? this.waitingHardcoreInvitation : this.waitingNormalInvitation;
			if (invitationList.length === 0) throw new WsException('No invitation found');

			invitationIndex = 0;
			invitation = invitationList[0];
			invitationList.splice(0, 1);
		} else {
			invitationIndex = this.waitingInvitation.findIndex((invitation) => invitation.id === invitationId);
			if (invitationIndex === -1) throw new WsException('Invitation not found');
			invitation = this.waitingInvitation[invitationIndex];
			this.waitingInvitation.splice(invitationIndex, 1);
		}

		const newGame = new GameState(invitation.mode);
		newGame.playersIds.push(invitation.player1id, client.data.user.id);
		this.currentGame.push(newGame);
		this.server.to([invitation.player1id, client.data.user.id].map((id) => id.toString())).emit('pong/newGame', { gameId: newGame.id, gameState: newGame });
	}

	// @SubscribeMessage('pong/playgame')
	// joinGame(client: Socket, player2id: number | null, mode: number) {
	// 	// no player2 given
	// 	if (this.waitingHardcoreModePlayerId) {
	// 		// create new game
	// 		new_game_id
	// 		this.server.to([client.data.user.id, this.waitingHardcoreModePlayerId]).emit('pong/newGame', new_game);
	// 		this.waitingHardcoreModePlayerId = null;
	// 	} else this.waitingHardcoreModePlayerId = client.data.user.id;
	// }

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
			console.log('No game found for this player');
			throw new WsException('No game found');
		}
		const game = this.currentGame[gameIndex];
		const playerIndex = game.playersIds.indexOf(client.data.user.id);
		game.playersReady[playerIndex] = true;

		client.data.gameIndex = gameIndex;
		client.data.playerIndex = playerIndex;

		if (game.playersReady.every(Boolean)) {
			this.startGame(gameIndex);
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
		const gameIndex = this.currentGame.findIndex((game) => game.playersIds.includes(client.data.user.id));

		if (gameIndex === -1) {
			console.log('No game found for this player');
			return;
		}

		const game = this.currentGame[gameIndex];
		const playerIndex = game.playersIds.indexOf(client.data.user.id);
		game.playersReady[playerIndex] = false;

		if (game.playersReady.every((ready) => !ready)) {
			console.log('Both players disconnected, game abandoned');
			this.server.to(game.playersIds.map((id) => id.toString())).emit('pong/gameAbandoned', game);
			this.endGame(gameIndex, e_match_state.ABANDONNED);
		} else {
			this.server.to(game.playersIds.filter((id) => id !== client.data.user.id).map((id) => id.toString())).emit('pong/playerDisconnected', client.data.user.id);
		}
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
			if (game && !game.playersReady.every((player) => player === true)) return;

			const now = Date.now();
			const deltaTime = now - game.timestamp;
			game.timestamp = now;
			this.UpdateBallState(game, deltaTime / 1000);
			this.updatePaddleState(game, deltaTime / 1000);

			if (game.player1.score >= 11 || game.player2.score >= 11) {
				return this.endGame(gameIndex, e_match_state.FINISHED);
			}

			this.sendGameState(game);
		}, 1000 / TIME_DIVISION);
	}

	endGame(gameIndex: number, state: e_match_state) {
		const game = this.currentGame[gameIndex];

		this.prismaMatch.create(game.playersIds[0], game.playersIds[1], game.player1.score, game.player2.score, game.mode, state);

		this.server.to(game.playersIds.map((id) => id.toString())).emit('pong/gameEnded', game);
		if (game.gameInterval) {
			clearInterval(game.gameInterval);
		}
		this.currentGame.splice(gameIndex, 1);
	}

	updatePaddleState(game: GameState, deltaTime: number) {
		for (const player of [game.player1, game.player2]) {
			if (player.paddleDirection === 'up') {
				player.paddleY = Math.max(player.paddleY - player.paddleSpeed * deltaTime, 0);
			} else if (player.paddleDirection === 'down') {
				player.paddleY = Math.min(player.paddleY + player.paddleSpeed * deltaTime, CANVAS_HEIGHT - player.paddleHeight);
			}
		}
	}

	UpdateBallState(game: GameState, deltaTime: number) {
		// ball movement
		game.ball.x += game.ball.dx * deltaTime;
		game.ball.y += game.ball.dy * deltaTime;

		// horizontal
		if (game.ball.x > CANVAS_WIDTH || game.ball.x < 0) {
			// right side collision
			if (game.ball.x > CANVAS_WIDTH / 2 && game.ball.y >= game.player2.paddleY && game.ball.y <= game.player2.paddleY + game.player2.paddleHeight) {
				game.ball.dx = -game.ball.dx;
				const deltaY = game.ball.y - (game.player2.paddleY + game.player2.paddleHeight / 2);
				game.ball.dy = deltaY * 0.35;
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
			game.ball.dy = -game.ball.dy;
		}
	}
}
