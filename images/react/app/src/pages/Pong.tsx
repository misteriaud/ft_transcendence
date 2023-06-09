//Pong.tsx
import { useEffect, useRef, useState, useCallback, Fragment } from 'react';
import { useNotificationContext, useSocketContext } from '../hooks/useContext';
import { Button, DialogHeader, Dialog, DialogBody, DialogFooter, Spinner } from '@material-tailwind/react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from './Dashboard';
import { useMe } from '../hooks/useUser';
import { useCustomSWR } from '../hooks/useApi';

interface Ball {
	x: number;
	y: number;
	dx: number;
	dy: number;
}

interface Player {
	id: number;
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
	lastUpdate: number;
}

const Pong = () => {
	const { gameId } = useParams();
	const navigate = useNavigate();
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const { isConnected, socket } = useSocketContext();
	const [isReady, setIsReady] = useState(false);
	const [gameState, setGameState] = useState<GameState | null>(null);
	const intervalId: React.MutableRefObject<number | null> = useRef(null);
	const { data: resultData, error: resultError, isLoading: resultIsLoading, mutate: mutateResult } = useCustomSWR(`/pong/${gameId}`);
	const { notify } = useNotificationContext();

	// Ball predict
	const predictBallPosition = (ball: Ball, elapsed: number) => {
		const x = ball.x + ball.dx * elapsed;
		const y = ball.y + ball.dy * elapsed;
		return { x, y };
	};

	// Handlers
	const handleReadyClick = useCallback(() => {
		if (!isReady) {
			socket.emit('pong/ready', { gameId, isReady: true });
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
		const reduceFactor = 0.889;
		const reducedHeight = height * reduceFactor;
		const newY = y + (height - reducedHeight) / 2;
		context.fillStyle = 'white';
		context.fillRect(x, newY, width, reducedHeight);
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
		// console.log('draw game');
		drawField(context, canvasRef.current);

		const elapsed = (Date.now() - state.lastUpdate) / 1000;
		drawPaddle(context, 10, state.players[0].paddleY, state.paddleWidth, state.players[0].paddleHeight);
		drawPaddle(context, canvasRef.current.width - state.paddleWidth - 10, state.players[1].paddleY, state.paddleWidth, state.players[1].paddleHeight);
		if (state.wall) {
			drawWall(context, state.wall);
		}

		const predictedBall = predictBallPosition(state.ball, elapsed);
		drawBall(context, predictedBall.x, predictedBall.y, state.ballRadius);
		//drawBall(context, state.ball.x, state.ball.y, state.ballRadius);
		drawScore(context, state.players[0].score, canvasRef.current.width / 4, 30);
		drawScore(context, state.players[1].score, (canvasRef.current.width * 3) / 4, 30);
	}

	// Effects

	useEffect(() => {
		if (resultData) {
			notify({ elem: <h1>This game is finished</h1>, color: 'green' });
			return navigate('result');
		}
	}, [resultData]);

	useEffect(() => {
		if (!isConnected) return;
		socket.on('pong/gameState', (gameState: GameState) => {
			gameState.lastUpdate = Date.now();
			setGameState(gameState);
		});

		socket.on('pong/gameEnded', () => {
			setIsReady(false);
			mutateResult(resultData);
			navigate(`result`);
		});

		return () => {
			socket.emit('pong/ready', { gameId, isReady: false });
			socket.off('pong/gameState');
			socket.off('pong/gameEnded');
		};
	}, [isConnected, socket]);

	useEffect(() => {
		if (isReady) {
			window.addEventListener('keyup', handleKeyUp);
			window.addEventListener('keydown', handleKeyDown);
		}

		return () => {
			window.removeEventListener('keyup', handleKeyUp);
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [handleKeyDown, handleKeyUp, isReady]);

	useEffect(() => {
		console.log('set loop');
		const loop = () => {
			if (canvasRef.current && gameState && isReady) {
				// const newGameState = { ...gameState };
				// setGameState(newGameState);
				drawGame(gameState);
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
		<div className="flex justify-center items-center h-full bg-black w-full">
			{isReady && !gameState && <Spinner className="absolute w-16 h-16" />}
			{!isReady ? (
				<Button color="blue" className="z-50" onClick={handleReadyClick}>
					Ready
				</Button>
			) : (
				<canvas ref={canvasRef} width={800} height={450} className="aspect-auto w-full min-h-fit" />
			)}
		</div>
	);
};

export default Pong;
