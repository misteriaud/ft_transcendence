import { useEffect, useRef, useState, useCallback } from 'react';
import { useSocketContext } from '../hooks/useContext';
//import { io, Socket } from 'socket.io-client';

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

	// Keyboard event listeners
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === 'w' || e.key === 'W') {
				socket.emit('pong/movePaddle', 'up');
			} else if (e.key === 's' || e.key === 'S') {
				socket.emit('pong/movePaddle', 'down');
			}
		},
		[socket]
	);

	const handleKeyUp = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === 'w' || e.key === 'W' || e.key === 's' || e.key === 'S') {
				socket.emit('pong/movePaddle', 'stop');
			}
		},
		[socket]
	);

	// Connection event listeners
	useEffect(() => {
		if (!isConnected) return;
		socket.on('pong/gameState', (newGameState: GameState) => {
			console.log('Received game state', newGameState);
			setGameState(newGameState);
			if (newGameState.playersReady.every(Boolean)) {
				window.addEventListener('keyup', handleKeyUp);
				window.addEventListener('keydown', handleKeyDown);
			} else {
				window.removeEventListener('keyup', handleKeyUp);
				window.removeEventListener('keydown', handleKeyDown);
			}
		});
		return () => {
			socket.off('pong/gameState');
		};
	}, [isConnected, handleKeyUp, handleKeyDown]);

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
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const context = canvas.getContext('2d');
		if (!context) return;

		const drawPaddle = (x: number, y: number, width: number, height: number) => {
			context.fillStyle = 'white';
			context.fillRect(x, y, width, height);
		};

		const drawField = () => {
			context.fillStyle = 'black';
			context.fillRect(0, 0, canvas.width, canvas.height);
		};

		const render = () => {
			drawField();
			if (gameState) {
				drawPaddle(10, gameState.player1.paddleY, gameState.paddleWidth, gameState.paddleHeight);
				drawPaddle(canvas.width - gameState.paddleWidth - 10, gameState.player2.paddleY, gameState.paddleWidth, gameState.paddleHeight);
			}

			requestAnimationFrame(render);
		};

		render();

		//return () => {};
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
			<canvas ref={canvasRef} width={500} height={500} />
			<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleReadyClick}>
				Ready
			</button>
		</div>
	);
};

export default Pong;
