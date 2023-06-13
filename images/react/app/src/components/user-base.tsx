import { forwardRef, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, MenuHandler, MenuItem, MenuList, Typography } from '@material-tailwind/react';
import { ChatBubbleOvalLeftEllipsisIcon, HomeIcon, RocketLaunchIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import { e_member_role, e_room_access, e_user_status, i_blocked, i_friends, i_me, i_member, i_room, i_user } from './interfaces';
import { useNotifyError, useNotifySuccess } from '../hooks/notifications';
import { getStatus, useSocketContext } from '../hooks/useContext';
import { useApi } from '../hooks/useApi';
import { ObservableContext } from '../context/storeProvider';

export const MenuBaseItems = forwardRef((props: any, ref: any) => {
	const { me, user, onClick, ...otherProps }: { me: i_me; user: i_user; onClick?: (event: React.MouseEvent<HTMLElement>) => void; otherProps?: any } = props;
	const location = useLocation();
	const navigate = useNavigate();
	const notifySuccess = useNotifySuccess();
	const notifyError = useNotifyError();
	const { isConnected, socket } = useSocketContext();
	const api = useApi();
	const subject = useContext(ObservableContext);
	const status = getStatus(me.id);

	const isMeInGame = status === e_user_status.INGAME;

	const invitableRooms = me.memberOf.filter(
		(m: i_member) =>
			(m.role === e_member_role.OWNER || m.role === e_member_role.ADMIN) &&
			m.room.access !== e_room_access.DIRECT_MESSAGE &&
			typeof m.room.members.find((member: i_member) => member.user_id === user.id) === 'undefined'
	);

	const isCurrentLocationMeProfile = location.pathname === `/dashboard/users/${user.id}` || location.pathname === `/dashboard/users/${user.login42}`;
	const areMeAndUserFriends = me.friends.some((f: i_friends) => f.userB.id === user.id);
	const hasMeOneInvitableRooms = invitableRooms.length > 0;
	const meBlockUser = me.blocked.some((f: i_blocked) => f.userB.id === user.id);
	const userBlockMe = me.blockedBy.some((f: i_blocked) => f.userB.id === me.id);

	const disableProfile = isCurrentLocationMeProfile || meBlockUser || userBlockMe;
	const disableSendMessage = !areMeAndUserFriends || meBlockUser || userBlockMe;
	const disableInviteToRoom = !areMeAndUserFriends || !hasMeOneInvitableRooms || meBlockUser || userBlockMe;
	const disableInviteToGame = isMeInGame || meBlockUser || userBlockMe;

	function handleProfile(onClick?: (event: React.MouseEvent<HTMLElement>) => void, e?: React.MouseEvent<HTMLElement>) {
		if (onClick && e) {
			onClick(e);
		}
		navigate(`/dashboard/users/${user.login42}`);
	}

	function handleSendMessage(onClick?: (event: React.MouseEvent<HTMLElement>) => void, e?: React.MouseEvent<HTMLElement>) {
		if (onClick && e) {
			onClick(e);
		}
		subject.next({ type: 'chat', content: user.id });
	}

	async function handleInviteToRoom(room: i_room, onClick?: (event: React.MouseEvent<HTMLElement>) => void, e?: React.MouseEvent<HTMLElement>) {
		if (onClick && e) {
			onClick(e);
		}
		if (isConnected) {
			await api
				.post(`/rooms/${room.id}/invitation`, {
					sub: user.id
				})
				.then((res) => {
					socket.emit('chat/postMessage', {
						roomId: me.memberOf.filter(
							(m: i_member) => m.room.access === e_room_access.DIRECT_MESSAGE && m.room.members.find((member: i_member) => member.user_id === user.id)
						)?.[0]?.room.id,
						content: `[room-invitation]${room.name}[separator]${room.id}[separator]${user.id}[separator]${res.data.token}`
					});
					notifySuccess('Invitation sent.');
				})
				.catch(() => {
					notifyError();
				});
		} else {
			notifyError();
		}
	}

	function handleInviteToGame(onClick?: (event: React.MouseEvent<HTMLElement>) => void, e?: React.MouseEvent<HTMLElement>) {
		if (onClick && e) {
			onClick(e);
		}
		subject.next({ type: 'game', content: user.id });
	}

	return (
		<>
			<MenuItem
				ref={ref}
				{...otherProps}
				className="flex items-center gap-2 outline-none"
				disabled={disableProfile}
				onClick={(e) => handleProfile(onClick, e)}
				tabIndex={-1}
			>
				<UserCircleIcon strokeWidth={2} className="h-4 w-4" />
				<Typography variant="small" className="font-normal">
					{user.username}'s Profile
				</Typography>
			</MenuItem>
			<MenuItem
				ref={ref}
				{...otherProps}
				className="flex items-center gap-2 outline-none"
				disabled={disableSendMessage}
				tabIndex={-1}
				onClick={(e) => handleSendMessage(onClick, e)}
			>
				<ChatBubbleOvalLeftEllipsisIcon strokeWidth={2} className="h-4 w-4" />
				<Typography variant="small" className="font-normal">
					Send Message
				</Typography>
			</MenuItem>
			<Menu ref={ref} {...otherProps} placement="right-start" offset={15}>
				<MenuHandler>
					<MenuItem className="flex items-center gap-2 outline-none" disabled={disableInviteToRoom} tabIndex={-1}>
						<HomeIcon strokeWidth={2} className="h-4 w-4" />
						<Typography variant="small" className="font-normal">
							Invite to Room
						</Typography>
					</MenuItem>
				</MenuHandler>
				<MenuList>
					{invitableRooms.map((m: i_member) => (
						<MenuItem key={m.room.id} className="flex items-center gap-2 outline-none" onClick={(e) => handleInviteToRoom(m.room, onClick, e)} tabIndex={-1}>
							{m.room.name}
						</MenuItem>
					))}
				</MenuList>
			</Menu>
			<MenuItem
				ref={ref}
				{...otherProps}
				className="flex items-center gap-2 outline-none"
				disabled={disableInviteToGame}
				tabIndex={-1}
				onClick={(e) => handleInviteToGame(onClick, e)}
			>
				<RocketLaunchIcon strokeWidth={2} className="h-4 w-4" />
				<Typography variant="small" className="font-normal">
					Invite to Game
				</Typography>
			</MenuItem>
		</>
	);
});
