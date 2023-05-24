import { useEffect, useRef, useState, useCallback } from 'react';
import { useSocketContext } from '../hooks/useContext';
import { Button } from '@material-tailwind/react';
import { throttle } from 'lodash';

interface GameState {
	ball: { x: number; y: number; dx: number; dy: number };
	player1: { paddleY: number; score: number };
	player2: { paddleY: number; score: number };
	paddleHeight: number;
	paddleWidth: number;
	ballRadius: number;
	playersReady: boolean[];
}

const Pong = () => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const { isConnected, socket } = useSocketContext();
	const [isReady, setIsready] = useState(false);
	const [gameState, setGameState] = useState<GameState | null>(null);
	const [localGameState, setLocalGameState] = useState<GameState | null>(null);

	// Keyboard event listeners
	const handleKeyDown = useCallback(
		throttle((e: KeyboardEvent) => {
			if (localGameState && canvasRef.current) {
				if (e.key === 'w' || e.key === 'W') {
					setLocalGameState({
						...localGameState,
						player1: {
							...localGameState.player1,
							paddleY: Math.max(0, localGameState.player1.paddleY - 5)
						}
					});
					socket.emit('pong/movePaddle', 'up');
				} else if (e.key === 's' || e.key === 'S') {
					setLocalGameState({
						...localGameState,
						player1: {
							...localGameState.player1,
							paddleY: Math.min(canvasRef.current.height - localGameState.paddleHeight, localGameState.player1.paddleY + 5)
						}
					});
					socket.emit('pong/movePaddle', 'down');
				}
			}
		}, 100),
		[socket, localGameState]
	);

	const handleKeyUp = useCallback(
		throttle((e: KeyboardEvent) => {
			if (e.key === 'w' || e.key === 'W' || e.key === 's' || e.key === 'S') {
				socket.emit('pong/movePaddle', 'stop');
			}
		}, 100),
		[socket]
	);

	// Connection event listeners
	useEffect(() => {
		if (isConnected) {
			socket.on('pong/gameState', (newGameState: GameState) => {
				console.log('Received game state', newGameState);

				setGameState(newGameState);
				setLocalGameState(newGameState);

				if (newGameState.playersReady.every(Boolean)) {
					window.addEventListener('keyup', handleKeyUp);
					window.addEventListener('keydown', handleKeyDown);
				} else {
					window.removeEventListener('keyup', handleKeyUp);
					window.removeEventListener('keydown', handleKeyDown);
				}
			});

			socket.on('userDisconnected', () => {
				alert('You have been disconnected from the server');
				setIsready(false);
				window.removeEventListener('keyup', handleKeyUp);
				window.removeEventListener('keydown', handleKeyDown);
			});

			window.addEventListener('keyup', handleKeyUp);
			window.addEventListener('keydown', handleKeyDown);

			return () => {
				socket.off('pong/gameState');
				socket.off('userDisconnected');
				window.removeEventListener('keyup', handleKeyUp);
				window.removeEventListener('keydown', handleKeyDown);
			};
		}
	}, [isConnected, handleKeyUp, handleKeyDown, socket]);

	// Keyboard movement effects
	useEffect(() => {
		window.addEventListener('keyup', handleKeyUp);
		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('keyup', handleKeyUp);
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [handleKeyUp, handleKeyDown]);

	// Canvas rendering
	const drawPaddle = (context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
		context.fillStyle = 'white';
		context.fillRect(x, y, width, height);
	};

	const drawField = (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
		context.fillStyle = 'black';
		context.fillRect(0, 0, canvas.width, canvas.height);
	};

	const drawBall = (context: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
		context.beginPath();
		context.arc(x, y, radius, 0, Math.PI * 2, false);
		context.fillStyle = 'white';
		context.fill();
		context.closePath();
	};

	const drawScore = (context: CanvasRenderingContext2D, score: number, x: number, y: number) => {
		context.fillStyle = 'white';
		context.font = '16px Arial';
		context.fillText(`Score: ${score}`, x, y);
	};

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const context = canvas.getContext('2d');
		if (!context) return;

		let animationFrameId: number;
		let lastLocalGameState: GameState | null;

		const render = () => {
			if (localGameState) {
				if (localGameState !== lastLocalGameState) {
					drawField(context, canvas);
					drawPaddle(context, 10, localGameState.player1.paddleY, localGameState.paddleWidth, localGameState.paddleHeight);
					drawPaddle(
						context,
						canvas.width - localGameState.paddleWidth - 10,
						localGameState.player2.paddleY,
						localGameState.paddleWidth,
						localGameState.paddleHeight
					);
					drawBall(context, localGameState.ball.x, localGameState.ball.y, localGameState.ballRadius);
					lastLocalGameState = localGameState;
					drawScore(context, localGameState.player1.score, canvas.width / 4, 30);
					drawScore(context, localGameState.player2.score, (canvas.width * 3) / 4, 30);
					lastLocalGameState = localGameState;
				}
				animationFrameId = requestAnimationFrame(render);
			}
		};

		render();

		return () => {
			if (animationFrameId) {
				cancelAnimationFrame(animationFrameId);
			}
		};
	}, [gameState]);

	// Ready Click Handler
	const handleReadyClick = () => {
		if (!isReady) {
			socket.emit('pong/ready');
			setIsready(true);
		}
	};

	return (
		<div className="absolute inset-0 flex flex-col items-center justify-center">
			<div className="relative">
				<canvas ref={canvasRef} width={500} height={500} className="bg-black" />
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
