import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSocketContext } from '../hooks/useContext';

interface GameState {
	ball: { x: number; y: number; dx: number; dy: number };
	player1: { paddleY: number; score: number };
	player2: { paddleY: number; score: number };
	paddleHeight: number;
	paddleWidth: number;
	ballRadius: number;
}

type Direction = 'up' | 'down';

const Pong = () => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const { isConnected, socket } = useSocketContext();
	// const [gameStarted, setGameStarted] = useState(false);
	// const [connectedPlayers, setConnectedPlayers] = useState(0);
	// const [player1Ready, setPlayer1Ready] = useState(false);
	// const [player2Ready, setPlayer2Ready] = useState(false);

	// const draw = useCallback((gameState: GameState | null) => {
	// 	if (!gameState) return; // gameState is not ready
	// 	const canvas = canvasRef.current;
	// 	if (!canvas) return; // canvas is not ready

	// 	const context = canvas.getContext('2d');
	// 	if (!context) return; // context is not ready

	// 	// Clear the canvas
	// 	context.clearRect(0, 0, canvas.width, canvas.height);

	// 	// Draw the ball
	// 	context.beginPath();
	// 	context.arc(gameState.ball.x, gameState.ball.y, gameState.ballRadius, 0, Math.PI * 2);
	// 	context.fillStyle = 'red';
	// 	context.fill();
	// 	context.closePath();

	// 	// Draw the paddles
	// 	context.fillRect(20, gameState.player1.paddleY, gameState.paddleWidth, gameState.paddleHeight);
	// 	context.fillRect(canvas.width - 30, gameState.player2.paddleY, gameState.paddleWidth, gameState.paddleHeight);

	// 	// Draw the scores
	// 	context.font = '16px Arial';
	// 	context.fillText(`Player 1: ${gameState.player1.score}`, 10, 20);
	// 	context.fillText(`Player 2: ${gameState.player2.score}`, canvas.width - 80, 20);
	// }, []);

	// const movePaddle = useCallback(
	// 	(direction: Direction) => {
	// 		socket.emit('movePaddle', { direction, player: 'player1' }); // replace player1 with actual player id
	// 	},
	// 	[socket]
	// );

	// const startGame = () => {
	// 	if (connectedPlayers === 2 && player1Ready && player2Ready) {
	// 		socket.emit('startGame');
	// 		setGameStarted(true);
	// 	}
	// };

	// const handlePlayer1Ready = () => {
	// 	setPlayer1Ready(true);
	// 	socket.emit('playerReady', 'player1');
	// };

	// const handlePlayer2Ready = () => {
	// 	setPlayer2Ready(true);
	// 	socket.emit('playerReady', 'player2');
	// };

	// useEffect(() => {
	// 	if (!isConnected) return;
	// 	socket.on('connect_error', (error) => {
	// 		console.error('Connection Error', error);
	// 	});

	// 	socket.on('connect', () => {
	// 		console.log('Connected to server');
	// 	});

	// 	socket.on('disconnect', () => {
	// 		console.log('Disconnected from server');
	// 	});

	// 	socket.on('pong/gameState', (newGameState: GameState) => {
	// 		console.log('Received game state', newGameState);
	// 		draw(newGameState);
	// 	});

	// 	socket.on('playerConnected', (numPlayers: number) => {
	// 		setConnectedPlayers(numPlayers);
	// 	});

	// 	socket.on('playerDisconnected', (numPlayers: number) => {
	// 		setConnectedPlayers(numPlayers);
	// 	});

	// 	// const handleKeyDown = (e: KeyboardEvent) => {
	// 	// 	switch (e.key) {
	// 	// 		case 'ArrowUp':
	// 	// 			movePaddle('up');
	// 	// 			break;
	// 	// 		case 'ArrowDown':
	// 	// 			movePaddle('down');
	// 	// 			break;
	// 	// 		default:
	// 	// 			break;
	// 	// 	}
	// 	// };

	// 	// window.addEventListener('keydown', handleKeyDown);

	// 	// Remove event listeners when the component is unmounted
	// 	return () => {
	// 		// window.removeEventListener('keydown', handleKeyDown);
	// 		socket.off('connect');
	// 		socket.off('disconnect');
	// 		socket.off('playerConnected');
	// 		socket.off('playerDisconnected');
	// 		socket.off('connect_error');
	// 		socket.off('gameState');
	// 		socket.disconnect();
	// 	};
	// }, [socket]);

	useEffect(() => {
		if (!isConnected) return;
		socket.on('pong/gameState', (newGameState: GameState) => {
			console.log('Received game state', newGameState);
		});
		return () => {
			socket.off('pong/gameState');
		};
	}, [isConnected]);

	return (
		<div className="flex flex-col">
			<canvas ref={canvasRef} width={500} height={500} />
			<button
				onClick={() => {
					socket.emit('pongReady');
				}}
			>
				Player 1 Ready
			</button>
			<button
				onClick={() => {
					socket.emit('pong/movePaddle', 'up');
				}}
			>
				up
			</button>
			<button
				onClick={() => {
					socket.emit('pong/movePaddle', 'down');
				}}
			>
				down
			</button>
			{/* {!gameStarted && connectedPlayers === 2 && (
				<div>
					<button disabled={player1Ready} onClick={handlePlayer1Ready}>
						Player 1 Ready
					</button>
					<button disabled={player2Ready} onClick={handlePlayer2Ready}>
						Player 2 Ready
					</button>
					{player1Ready && player2Ready && <button onClick={startGame}>Start Game</button>}
				</div>
			)} */}
		</div>
	);
};

export default Pong;
