//Pong.tsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { useSocketContext } from '../hooks/useContext';
import { Button } from '@material-tailwind/react';

interface Ball {
	x: number;
	y: number;
	dx: number;
	dy: number;
	ax: number;
	ay: number;
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
	const intervalId: React.MutableRefObject<number | null> = useRef(null);

	// Ball predict
	const predictBallPosition = (ball: Ball, time: number) => {
		const elapsed = time - ball.lastUpdate;
		console.log(elapsed);
		const x = ball.x + ball.dx * elapsed;
		const y = ball.y + ball.dy * elapsed;
		console.log(ball.ax);
		return { x, y };
	};

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

	function drawGame(state: GameState) {
		if (!canvasRef.current || !state) return;

		const context = canvasRef.current.getContext('2d');
		if (!context) return;
		console.log('draw game state');
		drawField(context, canvasRef.current);
		drawPaddle(context, 10, state.player1.paddleY, state.paddleWidth, state.player1.paddleHeight);
		drawPaddle(context, canvasRef.current.width - state.paddleWidth - 10, state.player2.paddleY, state.paddleWidth, state.player2.paddleHeight);

		const predictedBall = predictBallPosition(state.ball, Date.now());
		drawBall(context, predictedBall.x, predictedBall.y, state.ballRadius);
		//drawBall(context, state.ball.x, state.ball.y, state.ballRadius);
		drawScore(context, state.player1.score, canvasRef.current.width / 4, 30);
		drawScore(context, state.player2.score, (canvasRef.current.width * 3) / 4, 30);
	}

	// Effects
	useEffect(() => {
		if (isConnected) {
			socket.on('pong/gameState', (gameState) => {
				setIsReady(true);
				const newState = JSON.parse(JSON.stringify(gameState));
				newState.ball.lastUpdate = Date.now();
				setGameState(newState);
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
	}, [isConnected, socket]);

	useEffect(() => {
		window.addEventListener('keyup', handleKeyUp);
		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('keyup', handleKeyUp);
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [handleKeyDown, handleKeyUp]);

	useEffect(() => {
		console.log('new game state');
		if (canvasRef.current && gameState && isReady)
			intervalId.current = window.setInterval(() => {
				drawGame(gameState);
			}, 1000 / 120);
		return () => {
			if (intervalId.current) clearInterval(intervalId.current);
		};
	}, [canvasRef, gameState, isReady]);

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
