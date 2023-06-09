//Pong.tsx
import { useEffect, useRef, useState, useCallback, Fragment } from 'react';
import { useSocketContext } from '../hooks/useContext';
import { Button, DialogHeader, Dialog, DialogBody, DialogFooter } from '@material-tailwind/react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from './Dashboard';

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
	players: Player[];
	paddleWidth: number;
	ballRadius: number;
	playersReady: boolean[];
	wall: { x: number; y: number; width: number; height: number } | null;
}

const Pong = () => {
	const { gameId } = useParams();
	const navigate = useNavigate();
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const { isConnected, socket } = useSocketContext();
	const [isReady, setIsReady] = useState(false);
	const [gameState, setGameState] = useState<GameState | null>(null);
	const intervalId: React.MutableRefObject<number | null> = useRef(null);
	const [open, setOpen] = useState(false);
	const handleOpen = () => setOpen(!open);
	const handleConfirm = () => {
		navigate(`/dashboard/`);
	};

	// Ball predict
	const predictBallPosition = (ball: Ball, time: number) => {
		const elapsed = (time - ball.lastUpdate) / 1000;
		const x = ball.x + ball.dx * elapsed;
		const y = ball.y + ball.dy * elapsed;
		return { x, y };
	};

	// Handlers
	const handleReadyClick = useCallback(() => {
		if (!isReady) {
			socket.emit('pong/ready', gameId);
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

	const drawWall = useCallback((context: CanvasRenderingContext2D, wall: { x: number; y: number; width: number; height: number }) => {
		context.fillStyle = 'white';
		context.fillRect(wall.x, wall.y, wall.width, wall.height);
	}, []);

	function drawGame(state: GameState) {
		if (!canvasRef.current || !state) return;

		const context = canvasRef.current.getContext('2d');
		if (!context) return;
		drawField(context, canvasRef.current);
		drawPaddle(context, 10, state.players[0].paddleY, state.paddleWidth, state.players[0].paddleHeight);
		drawPaddle(context, canvasRef.current.width - state.paddleWidth - 10, state.players[1].paddleY, state.paddleWidth, state.players[1].paddleHeight);
		if (state.wall) {
			drawWall(context, state.wall);
		}

		const predictedBall = predictBallPosition(state.ball, Date.now());
		drawBall(context, predictedBall.x, predictedBall.y, state.ballRadius);
		drawScore(context, state.players[0].score, canvasRef.current.width / 4, 30);
		drawScore(context, state.players[1].score, (canvasRef.current.width * 3) / 4, 30);
	}

	// Effects
	useEffect(() => {
		if (isConnected) {
			socket.on('pong/gameState', (gameState) => {
				setIsReady(true);
				gameState.ball.lastUpdate = Date.now();
				setGameState(gameState);
			});

			socket.on('pong/gameEnded', () => {
				setOpen(true);
				//alert('Game has ended');
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
		const loop = () => {
			if (canvasRef.current && gameState && isReady) {
				const newGameState = { ...gameState };
				setGameState(newGameState);
				drawGame(newGameState);
			}
			intervalId.current = requestAnimationFrame(loop);
		};

		intervalId.current = requestAnimationFrame(loop);

		return () => {
			if (intervalId.current) cancelAnimationFrame(intervalId.current);
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
				<Fragment>
					<Dialog open={open} handler={handleOpen} size="xs">
						<DialogHeader>Game Ended</DialogHeader>
						<DialogBody divider>
							<span className="text-x1 font-bold text-blue-600">
								Player 1 : {gameState?.players[0].score} points <br />
							</span>
							<span className="text-x1 font-bold text-red-600">
								Player 2 : {gameState?.players[1].score} points <br />
							</span>
						</DialogBody>
						<DialogFooter>
							<Button variant="gradient" color="green" onClick={handleConfirm}>
								<span>Return to Lobby</span>
							</Button>
						</DialogFooter>
					</Dialog>
				</Fragment>
			</div>
		</div>
	);
};

export default Pong;
