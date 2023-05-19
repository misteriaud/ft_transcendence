import {
	SubscribeMessage,
	WebSocketGateway,
	OnGatewayConnection,
	OnGatewayDisconnect,
	WsResponse,
  } from "@nestjs/websockets";
  import { Socket, Server } from "socket.io";

  interface GameState {
	ball: { x: number; y: number; dx: number; dy: number };
	player1: { paddleY: number; score: number };
	player2: { paddleY: number; score: number };
	paddleHeight: number;
	paddleWidth: number;
	ballRadius: number;
  }

  @WebSocketGateway({ cors: { origin: 'http://localhost:8080', methods: ['GET', 'POST'] } })
  export class PongGateway implements OnGatewayConnection, OnGatewayDisconnect {
	game: GameState;
	clients: Socket[] = [];

	constructor() {
	  this.game = {
		ball: { x: 250, y: 250, dx: 2, dy: 2 },
		player1: { paddleY: 200, score: 0 },
		player2: { paddleY: 200, score: 0 },
		paddleHeight: 80,
		paddleWidth: 10,
		ballRadius: 10,
	  };
	}

	handleConnection(client: Socket, ...args: any[]) {
	  console.log(`Client connected: ${client.id}`);
	  this.clients.push(client);

	  if (this.clients.length === 2) {
		this.startGame();
	  }
	}

	handleDisconnect(client: Socket) {
	  console.log(`Client disconnected: ${client.id}`);
	  this.clients = this.clients.filter((c) => c.id !== client.id);
	}

	@SubscribeMessage("movePaddle")
	handlePaddleMove(
	  client: Socket,
	  payload: { direction: "up" | "down"; player: "player1" | "player2" }
	) {
	  const speed = 5;

	  if (payload.direction === "up") {
		this.game[payload.player].paddleY -= speed;
	  } else {
		this.game[payload.player].paddleY += speed;
	  }

	  this.sendGameState();
	}

	startGame() {
	  setInterval(() => {
		this.game.ball.x += this.game.ball.dx;
		this.game.ball.y += this.game.ball.dy;

		// Collision with top and bottom wall
		if (
		  this.game.ball.y + this.game.ball.dy < this.game.ballRadius ||
		  this.game.ball.y + this.game.ball.dy > 500 - this.game.ballRadius
		) {
		  this.game.ball.dy = -this.game.ball.dy;
		}

		// Collision detection with paddles
		if (
		  this.game.ball.x < 0 + this.game.paddleWidth &&
		  this.game.ball.y > this.game.player1.paddleY &&
		  this.game.ball.y < this.game.player1.paddleY + this.game.paddleHeight
		) {
		  this.game.ball.dx = -this.game.ball.dx;
		} else if (
		  this.game.ball.x > 500 - this.game.paddleWidth &&
		  this.game.ball.y > this.game.player2.paddleY &&
		  this.game.ball.y < this.game.player2.paddleY + this.game.paddleHeight
		) {
		  this.game.ball.dx = -this.game.ball.dx;
		}

		// Scoring
		if (this.game.ball.x + this.game.ball.dx < this.game.ballRadius) {
		  // Player 2 scores
		  this.game.player2.score += 1;
		  this.game.ball = { x: 250, y: 250, dx: 2, dy: 2 };
		} else if (
		  this.game.ball.x + this.game.ball.dx > 500 - this.game.ballRadius
		) {
		  // Player 1 scores
		  this.game.player1.score += 1;
		  this.game.ball = { x: 250, y: 250, dx: 2, dy: 2 };
		}

		this.sendGameState();
	  }, 1000 / 60); // 60 FPS
	}

	sendGameState() {
	  this.clients.forEach((client) => {
		client.emit("gameState", this.game);
	  });
	}
  }
