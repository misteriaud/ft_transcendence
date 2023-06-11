import React, { useState, Fragment, useEffect, useRef, useContext } from 'react';
import {
	Button,
	Dialog,
	DialogHeader,
	DialogBody,
	DialogFooter,
	Select,
	Option,
	Switch,
	Spinner,
	IconButton,
	Menu,
	MenuHandler,
	MenuList,
	MenuItem
} from '@material-tailwind/react';
import { BellAlertIcon, BellIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { usePresenceContext, useSocketContext } from '../hooks/useContext';
import { format } from 'date-fns';
import { NavigateOptions, useNavigate } from 'react-router-dom';
import { ObservableContext, ObservableNotification } from '../context/storeProvider';
import { User } from './user';
import { useMe } from '../hooks/useUser';
import { e_invitation } from './interfaces';
//import { useMe } from '../hooks/useUser';

export function InvitationButton() {
	const navigate = useNavigate();
	const { isConnected, socket } = useSocketContext();
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [invitations, setInvitations] = useState<e_invitation[]>([]);
	const { me } = useMe();

	useEffect(() => {
		if (!isConnected) return;
		socket.on('pong/invitation', (invitation: e_invitation) => {
			console.log('invitation received');
			setInvitations((prev) => [...prev, invitation]);

			//navigate(pathname: '/pong',
			//option: '?=${gameId}');
			// navigate(`/dashboard/pong/${gameId}`);
		});

		return () => {
			socket.off('pong/invitation');
		};
	}, [socket, isConnected, setInvitations]);

	// function useInterval(callback: () => void, delay: number | null) {
	// 	const savedCallback = useRef(callback);

	// 	useEffect(() => {
	// 		savedCallback.current = callback;
	// 	}, [callback]);

	// 	useEffect(() => {
	// 		function tick() {
	// 			savedCallback.current();
	// 		}
	// 		if (delay !== null) {
	// 			const id = setInterval(tick, delay);
	// 			return () => clearInterval(id);
	// 		}
	// 	}, [delay]);
	// }

	// useInterval(() => {
	// 	if (loading) setTimer((timer) => timer + 1);
	// }, 1000);

	const handleOpen = () => {
		setOpen(!open);
	};

	function acceptInvitation(index: number) {
		if (!isConnected) return;
		socket.emit('pong/acceptInvite', invitations[index].id);
		const new_array = [...invitations];
		new_array.splice(index);
		setInvitations(new_array);
	}

	// const handleJoin = () => {
	// 	setLoading(true);
	// 	handleOpen();
	// 	console.log(invitation);
	// 	socket.emit('pong/invite', invitation);
	// 	// redirect to /pong instance if successful
	// };

	// const cancelQueue = () => {
	// 	console.log('Queue canceled');
	// 	setLoading(false);
	// 	setTimer(0);
	// 	socket.emit('pong/cancelInvite', invitation);
	// };

	// const timerDate = new Date(timer * 1000);
	// <IconButton onClick={handleOpen} variant="text" disabled={invitations.length == 0}></IconButton>

	return (
		<Menu>
			<MenuHandler>
				<IconButton onClick={handleOpen} variant="text" disabled={invitations.length == 0}>
					{invitations.length ? <BellIcon className="h-5 w-5" /> : <BellAlertIcon className="h-5 w-5" />}
				</IconButton>
			</MenuHandler>
			<MenuList>
				{invitations.map((invitation: e_invitation, index: number) => (
					<MenuItem
						key={invitation.id}
						className="flex justify-around"
						onClick={() => {
							acceptInvitation(index);
						}}
					>
						<User
							login42={invitation.player1id.toString()}
							size="xs"
							onClick={() => {
								return;
							}}
						/>{' '}
						vs{' '}
						<User
							login42={invitation.player2id.toString()}
							size="xs"
							onClick={() => {
								return;
							}}
						/>
					</MenuItem>
				))}
			</MenuList>
		</Menu>
	);
}
