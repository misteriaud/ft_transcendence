import React, { useState, Fragment, useEffect, useRef, useContext } from 'react';
import { Button, Dialog, DialogHeader, DialogBody, DialogFooter, Select, Option, Switch, Spinner } from '@material-tailwind/react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { getStatus, useNotificationContext, usePresenceContext, useSocketContext } from '../hooks/useContext';
import { format } from 'date-fns';
import { NavigateOptions, useNavigate } from 'react-router-dom';
import { ObservableContext, ObservableNotification } from '../context/storeProvider';
import { User } from './user';
import { useMe } from '../hooks/useUser';
import { e_user_status, i_me } from './interfaces';
import { useMatch } from 'react-router-dom';

interface i_invitation {
	id?: string;
	player2id: null | number;
	mode: number;
}

export function GameButton() {
	const navigate = useNavigate();
	const { isConnected, socket } = useSocketContext();
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [timer, setTimer] = useState(0);
	const [invitation, setInvitation] = useState<i_invitation>({
		player2id: null,
		mode: 0
	});
	const subject = useContext(ObservableContext);
	const { onlineIds } = usePresenceContext();
	const { me }: { me: i_me } = useMe();
	const { notify } = useNotificationContext();
	const isPongRoute = useMatch('/dashboard/pong/:id');

	useEffect(() => {
		if (!isConnected) return;
		console.log('listening on newGame');
		socket.on('pong/newGame', (gameId: string) => {
			setLoading(false);
			console.log('invitation received');
			//navigate(pathname: '/pong',
			//option: '?=${gameId}');
			navigate(`/dashboard/pong/${gameId}`);
		});

		return () => {
			socket.off('pong/newGame');
		};
	}, [socket, isConnected, navigate]);

	useEffect(() => {
		if (!isConnected) return;
		socket.on('pong/invitationCanceled', (cancelledInvitation) => {
			if (cancelledInvitation.player1id !== me.id || !invitation.id) return;
			notify({ elem: <h1>Your invitation has been refused</h1>, color: 'red' });
			setLoading(false);
			setTimer(0);
			setInvitation((invit) => {
				return { ...invit, id: undefined };
			});
		});
		return () => {
			socket.off('pong/invitationCanceled');
		};
	}, [socket, isConnected, invitation, setInvitation]);

	useEffect(() => {
		const subscription = subject.subscribe((notificationData: ObservableNotification) => {
			if (notificationData.type !== 'game') return;
			setInvitation((inv) => {
				return {
					...inv,
					player2id: notificationData.content
				};
			});
			setOpen(true);
			console.log('handle this');
		});

		return () => {
			// Clean up the subscription when the component unmounts
			subscription.unsubscribe();
		};
	}, []);

	function handleMode() {
		setInvitation({
			...invitation,
			mode: invitation.mode === 0 ? 1 : 0
		});
	}

	function handleSelect(e: any) {
		console.log(e);
		setInvitation({
			...invitation,
			player2id: e === 'Rand' ? null : Number(e)
		});
		// } else {
		// 	// logic for inviting a specific player
		// }
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
		setTimer(0);
		handleOpen();
		socket.emit('pong/invite', invitation, (invitationId: string) => {
			setInvitation({ ...invitation, id: invitationId });
		});
	};

	const cancelQueue = () => {
		console.log('Queue canceled');
		setLoading(false);
		setTimer(0);
		socket.emit('pong/cancelInvite', invitation.id);
		setInvitation({ ...invitation, id: undefined });
	};

	const timerDate = new Date(timer * 1000);

	const disableDialog = getStatus(me.id) === e_user_status.INGAME || !!isPongRoute;

	return (
		<Fragment>
			<Button onClick={handleOpen} variant="gradient" disabled={disableDialog}>
				{loading ? (
					<div className="flex items-center justify-center">
						<Spinner className="h-4 w-4" />
						<span className="ml-2">{format(timerDate, 'm:ss')}</span>
					</div>
				) : (
					'Play Game'
				)}
			</Button>
			<Dialog open={open && !disableDialog} handler={handleOpen}>
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
								<Select
									label="Player 2"
									onChange={handleSelect}
									selected={(element: any) => {
										if (invitation.player2id)
											return React.createElement(User, {
												login42: String(invitation.player2id),
												onClick: () => {
													return;
												}
											});
										if (element && !Array.isArray(element))
											return React.cloneElement(element, {
												className: 'flex items-center px-0 gap-2 pointer-events-none'
											});
									}}
									value={invitation.player2id ? String(invitation.player2id) : 'Rand'}
								>
									<Option key="rand" value="Rand">
										Random
									</Option>
									{onlineIds
										.filter((id) => id !== me.id)
										.map((id) => (
											<Option key={id} value={id.toString()}>
												<User
													login42={id.toString()}
													onClick={() => {
														return;
													}}
													ignoreHoverStyle={true}
												/>
											</Option>
										))}
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
