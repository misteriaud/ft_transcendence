//Pong.tsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { useSocketContext } from '../hooks/useContext';
import { Button } from '@material-tailwind/react';

interface Ball {
	x: number;
	y: number;
	dx: number;
	dy: number;
	lastUpdate: number;
}

interface Player {
	paddleY: number;
	score: number;
	paddleSpeed: number;
	paddleDirection: 'up' | 'down' | 'stop';
	paddleHeight: number;
}

interface GameState {
	ball: Ball;
	player1: Player;
	player2: Player;
	paddleWidth: number;
	ballRadius: number;
	playersReady: boolean[];
}

const Pong = () => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const { isConnected, socket } = useSocketContext();
	const [isReady, setIsReady] = useState(false);
	const [gameState, setGameState] = useState<GameState | null>(null);

	// Ball predict
	const predictBallPosition = useCallback((ball: Ball) => {
		const dt = (Date.now() - ball.lastUpdate) / 1000;
		return {
			...ball,
			x: ball.x + ball.dx * dt,
			y: ball.y + ball.dy * dt
		};
	}, []);

	// Handlers
	const handleReadyClick = useCallback(() => {
		if (!isReady) {
			socket.emit('pong/ready');
			setIsReady(true);
		}
	}, [isReady, socket]);

	function handleKeyDown(e: any) {
		if (e.repeat) return;
		if (gameState && isConnected) {
			switch (e.key.toLowerCase()) {
				case 'w':
					socket.emit('pong/movePaddle', 'up');
					break;
				case 's':
					socket.emit('pong/movePaddle', 'down');
					break;
			}
		}
	}

	function handleKeyUp(e: any) {
		if (e.repeat) return;
		if (gameState && isConnected) {
			if (e.key.toLowerCase() === 'w' || e.key.toLowerCase() === 's') {
				socket.emit('pong/movePaddle', 'stop');
			}
		}
	}
	// Draw Functions
	const drawPaddle = useCallback((context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
		context.fillStyle = 'white';
		context.fillRect(x, y, width, height);
	}, []);

	const drawField = useCallback((context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
		context.fillStyle = 'grey';
		context.fillRect(0, 0, canvas.width, canvas.height);
	}, []);

	const drawBall = useCallback((context: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
		context.beginPath();
		context.arc(x, y, radius, 0, Math.PI * 2, false);
		context.fillStyle = 'white';
		context.fill();
		context.closePath();
	}, []);

	const drawScore = useCallback((context: CanvasRenderingContext2D, score: number, x: number, y: number) => {
		context.fillStyle = 'white';
		context.font = '16px Arial';
		context.fillText(`Score: ${score}`, x, y);
	}, []);

	const drawGame = useCallback(
		(gameState: GameState) => {
			if (canvasRef.current) {
				const context = canvasRef.current.getContext('2d');
				if (context) {
					drawField(context, canvasRef.current);
					drawPaddle(context, 10, gameState.player1.paddleY, gameState.paddleWidth, gameState.player1.paddleHeight);
					drawPaddle(
						context,
						canvasRef.current.width - gameState.paddleWidth - 10,
						gameState.player2.paddleY,
						gameState.paddleWidth,
						gameState.player2.paddleHeight
					);

					const predictedBall = predictBallPosition(gameState.ball);
					drawBall(context, predictedBall.x, predictedBall.y, gameState.ballRadius);
					drawScore(context, gameState.player1.score, canvasRef.current.width / 4, 30);
					drawScore(context, gameState.player2.score, (canvasRef.current.width * 3) / 4, 30);
				}
			}
		},
		[drawField, drawPaddle, drawBall, drawScore, predictBallPosition]
	);

	// Effects
	useEffect(() => {
		if (isConnected) {
			socket.on('pong/gameState', (gameState) => {
				const newState = JSON.parse(JSON.stringify(gameState));
				newState.ball.lastUpdate = Date.now();
				setGameState(newState);
				drawGame(newState);
			});

			socket.on('pong/gameEnded', () => {
				alert('Game has ended');
				setIsReady(false);
			});

			return () => {
				socket.off('pong/gameState');
				socket.off('pong/gameEnded');
			};
		}
	}, [isConnected, socket, drawGame]);

	useEffect(() => {
		window.addEventListener('keyup', handleKeyUp);
		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('keyup', handleKeyUp);
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [handleKeyDown, handleKeyUp]);

	// Render
	return (
		<div className="absolute inset-0 flex flex-col items-center justify-center">
			<div className="relative">
				<canvas ref={canvasRef} width={800} height={450} className="bg-black" />
				{!isReady && (
					<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
						<Button color="blue" onClick={handleReadyClick}>
							Ready
						</Button>
					</div>
				)}
			</div>
		</div>
	);
};

export default Pong;
