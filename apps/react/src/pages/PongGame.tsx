/*
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

const PongGame = () => {
	const [gameState, setGameState] = useState({});

	useEffect(() => {
		// Subscribe to playerInput events from the server
		socket.on('playerInput', (input) => {
			// Update the game state with the received input
			setGameState((prevState) => ({
				...prevState,
				...input,
			}));
		});

		return () => {
			// Unsubscribe from playerInput events when the component unmounts
			socket.off('playerInput');
		};
	}, []);

	const handlePlayerInput = (input) => {
		// Send the input to the server
		socket.emit('playerInput', input);
	};

	// Render the Pong gane UI using the gameState

	return <div>...</div>;
};

export default PongGame;
*/

export {};
