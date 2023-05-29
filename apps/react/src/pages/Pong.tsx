import { useEffect, useRef, useState, useCallback } from 'react';
import { useSocketContext } from '../hooks/useContext';
import { Button } from '@material-tailwind/react';
import { throttle } from 'lodash';

interface Ball {
	x: number;
	y: number;
	dx: number;
	dy: number;
}

interface Player {
	paddleY: number;
	score: number;
}

interface GameState {
	ball: Ball;
	player1: Player;
	player2: Player;
	paddleHeight: number;
	paddleWidth: number;
	ballRadius: number;
	playersReady: boolean[];
	fps: number;
}

const Pong = () => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const { isConnected, socket } = useSocketContext();
	const [isReady, setIsReady] = useState(false);
	const [gameState, setGameState] = useState<GameState | null>(null);

	// Handlers
	const handleReadyClick = useCallback(() => {
		if (!isReady) {
			socket.emit('pong/ready');
			setIsReady(true);
		}
	}, [isReady, socket]);

	const handlePaddleMove = useCallback(
		throttle((direction: string) => {
			if (gameState && isConnected) {
				socket.emit('pong/movePaddle', direction);
			}
		}, 150),
		[socket, gameState, isConnected]
	);

	function handleKeyDown(e: any) {
		if (e.repeat) return;
		console.log('keydown');
		switch (e.key.toLowerCase()) {
			case 'w':
				handlePaddleMove('up');
				break;
			case 's':
				handlePaddleMove('down');
				break;
		}
	}

	function handleKeyUp(e: any) {
		if (e.repeat) return;
		console.log('keyup');
		if (e.key.toLowerCase() === 'w' || e.key.toLowerCase() === 's') {
			handlePaddleMove('stop');
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

	// Effects
	useEffect(() => {
		if (isConnected) {
			socket.on('pong/gameState', setGameState);

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
	}, []);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas || !gameState) return;
		const context = canvas.getContext('2d');
		if (!context) return;

		const render = () => {
			drawField(context, canvas);
			drawPaddle(context, 10, gameState.player1.paddleY, gameState.paddleWidth, gameState.paddleHeight);
			drawPaddle(context, canvas.width - gameState.paddleWidth - 10, gameState.player2.paddleY, gameState.paddleWidth, gameState.paddleHeight);
			drawBall(context, gameState.ball.x, gameState.ball.y, gameState.ballRadius);
			drawScore(context, gameState.player1.score, canvas.width / 4, 30);
			drawScore(context, gameState.player2.score, (canvas.width * 3) / 4, 30);

			requestAnimationFrame(render);
		};

		const animationFrameId = requestAnimationFrame(render);

		return () => cancelAnimationFrame(animationFrameId);
	}, [gameState, drawField, drawPaddle, drawBall, drawScore]);

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
