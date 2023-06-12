import { useState, useEffect } from 'react';
import { IconButton, Menu, MenuHandler, MenuList, MenuItem, Badge } from '@material-tailwind/react';
import { BellAlertIcon, BellIcon, BoltIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { User } from './user';
import { e_invitation } from './interfaces';
import { useSocketContext } from '../hooks/useContext';
//import { useMe } from '../hooks/useUser';

export function InvitationButton() {
	const { isConnected, socket } = useSocketContext();
	const [open, setOpen] = useState(false);
	const [invitations, setInvitations] = useState<e_invitation[]>([]);

	useEffect(() => {
		if (!isConnected) return;
		socket.on('pong/invitation', (invitation: e_invitation) => {
			console.log('invitation received');
			setInvitations((prev) => [...prev, invitation]);

			//navigate(pathname: '/pong',
			//option: '?=${gameId}');
			// navigate(`/dashboard/pong/${gameId}`);
		});
		socket.on('pong/invitationCanceled', (invitation) => {
			setInvitations((invits) => invits.filter((invit) => invit.id !== invitation.id));
		});

		return () => {
			socket.off('pong/invitation');
			socket.off('pong/invitationCanceled');
		};
	}, [socket, isConnected, setInvitations]);

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

	function cancelInvitation(index: number) {
		if (!isConnected) return;
		socket.emit('pong/cancelInvite', invitations[index].id);
		const new_array = [...invitations];
		new_array.splice(index);
		setInvitations(new_array);
	}

	return (
		<Menu>
			<MenuHandler>
				<IconButton onClick={handleOpen} variant="text" disabled={invitations.length == 0}>
					{invitations.length ? (
						<Badge content={invitations.length}>
							<BellAlertIcon className="h-5 w-5" />
						</Badge>
					) : (
						<BellIcon className="h-5 w-5" />
					)}
				</IconButton>
			</MenuHandler>
			<MenuList>
				{invitations.map((invitation: e_invitation, index: number) => (
					<MenuItem
						key={invitation.id}
						className="flex justify-around items-center"
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
							ignoreHoverStyle={true}
						/>
						<BoltIcon className="w-5 h-5" />
						<User
							login42={invitation.player2id.toString()}
							size="xs"
							onClick={() => {
								return;
							}}
							ignoreHoverStyle={true}
						/>
						<XMarkIcon
							className="h-4 w-4 opacity-20 hover:opacity-100"
							onClick={() => {
								cancelInvitation(index);
							}}
						/>
					</MenuItem>
				))}
			</MenuList>
		</Menu>
	);
}
