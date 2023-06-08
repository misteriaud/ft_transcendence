import React, { useState, Fragment, useEffect, useRef } from 'react';
import { Button, Dialog, DialogHeader, DialogBody, DialogFooter, Select, Option, Switch, Spinner } from '@material-tailwind/react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { useSocketContext } from '../hooks/useContext';
import { format } from 'date-fns';
//import { useMe } from '../hooks/useUser';

export function GameButton() {
	const { isConnected, socket } = useSocketContext();
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [timer, setTimer] = useState(0);
	const [invitation, setInvitation] = useState({
		player2id: null,
		mode: 0
	});

	function handleMode() {
		setInvitation({
			...invitation,
			mode: invitation.mode === 0 ? 1 : 0
		});
	}

	function handleSelect(e: any) {
		if (e === 'Rand') {
			setInvitation({
				//player should be null ?
				...invitation
			});
		} else {
			// logic for inviting a specific player
		}
	}

	function useInterval(callback: () => void, delay: number | null) {
		const savedCallback = useRef(callback);

		useEffect(() => {
			savedCallback.current = callback;
		}, [callback]);

		useEffect(() => {
			function tick() {
				savedCallback.current();
			}
			if (delay !== null) {
				const id = setInterval(tick, delay);
				return () => clearInterval(id);
			}
		}, [delay]);
	}

	useInterval(() => {
		if (loading) setTimer((timer) => timer + 1);
	}, 1000);

	const handleOpen = () => {
		if (loading) {
			cancelQueue();
		} else {
			setOpen(!open);
		}
		//add logic to leave queue
	};

	const handleJoin = () => {
		setLoading(true);
		handleOpen();
		console.log(invitation);
		socket.emit('pong/invite', invitation);
		// redirect to /pong instance if successful
	};

	const cancelQueue = () => {
		console.log('Queue canceled');
		setLoading(false);
		setTimer(0);
		socket.emit('pong/cancelInvite', invitation);
	};

	//useEffect(() => {
	//	socket.on('pong/newGame	', () => {
	//		setLoading(false);
	//		//push to /pong
	//	});

	//	return () => {
	//		socket.off('pong/newGame');
	//	};
	//}, [socket]);

	const timerDate = new Date(timer * 1000);

	return (
		<Fragment>
			<Button onClick={handleOpen} variant="gradient">
				{loading ? (
					<div className="flex items-center justify-center">
						<Spinner className="h-4 w-4" />
						<span className="ml-2">{format(timerDate, 'm:ss')}</span>
					</div>
				) : (
					'Play Game'
				)}
			</Button>
			<Dialog open={open} handler={handleOpen}>
				<div className="flex items-center justify-between">
					<DialogHeader>Play Pong</DialogHeader>
					<XMarkIcon className="mr-3 h-5 w-5" onClick={handleOpen} />
				</div>
				<DialogBody divider>
					<div className="grid gap-6">
						<div className="flex justify-center">
							<span className="mr-2">Normal </span>
							<Switch id="mode" label="Hardcore" checked={invitation.mode === 1} onChange={handleMode} />
						</div>
						<div className="flex justify-center">
							<div className="w-72">
								<Select label="Player 2" onChange={handleSelect}>
									<Option value="Rand">Random</Option>
									<Option value="Friend">Player 1</Option>
								</Select>
							</div>
						</div>
					</div>
				</DialogBody>
				<DialogFooter className="flex justify-center">
					<Button variant="gradient" color="green" onClick={handleJoin}>
						Play Game
					</Button>
				</DialogFooter>
			</Dialog>
		</Fragment>
	);
}
