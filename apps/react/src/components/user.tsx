import { forwardRef, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
	Button,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
	Menu,
	MenuHandler,
	MenuItem,
	MenuList,
	Option,
	Select,
	Spinner,
	Typography
} from '@material-tailwind/react';
import {
	ArrowLeftOnRectangleIcon,
	ChatBubbleOvalLeftEllipsisIcon,
	ExclamationTriangleIcon,
	HandRaisedIcon,
	HandThumbUpIcon,
	HomeIcon,
	RocketLaunchIcon,
	ScaleIcon,
	SparklesIcon,
	SpeakerWaveIcon,
	SpeakerXMarkIcon,
	UserCircleIcon,
	UserMinusIcon,
	UserPlusIcon
} from '@heroicons/react/24/solid';
import { KeyedMutator } from 'swr';
import { i_blocked, i_friend_requests, i_friends, i_me, i_member, i_room, i_user } from './interfaces';
import { e_member_role } from './interfaces';
import { useMe, useUser } from '../hooks/useUser';
import { useRoom } from '../hooks/useRoom';
import { useApi } from '../hooks/useApi';
import { UserUI } from './userUI';
import { getStatus, usePresenceContext } from '../hooks/useContext';

export function MuteDialog({ user, room, mutateRoom, dialogStatus, dialogHandler }: any) {
	const time = {
		_5m: 5 * 60 * 1000,
		_30m: 30 * 60 * 1000,
		_1h: 1 * 60 * 60 * 1000,
		_6h: 6 * 60 * 60 * 1000,
		_12h: 12 * 60 * 60 * 1000,
		_1d: 1 * 24 * 60 * 60 * 1000,
		_7d: 7 * 24 * 60 * 60 * 1000,
		_14d: 14 * 24 * 60 * 60 * 1000,
		_30d: 30 * 24 * 60 * 60 * 1000,
		_90d: 90 * 24 * 60 * 60 * 1000,
		_180d: 180 * 24 * 60 * 60 * 1000,
		_365d: 365 * 24 * 60 * 60 * 1000,
		_infinity: 70372022400000
	};
	const [muteFor, setMuteFor] = useState(time._5m);
	const [muteUntil, setMuteUntil] = useState(new Date(Date.now() + time._5m));
	const api = useApi();

	useEffect(() => {
		const interval = setInterval(() => {
			if (muteFor !== time._infinity) {
				setMuteUntil(new Date(Date.now() + muteFor));
			}
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	}, [muteFor]);

	function handleMuteDialogSelect(value: string | undefined) {
		if (typeof value === 'undefined' || value === '5m') {
			setMuteFor(time._5m);
			setMuteUntil(new Date(Date.now() + time._5m));
		} else if (value === '30m') {
			setMuteFor(time._30m);
			setMuteUntil(new Date(Date.now() + time._30m));
		} else if (value === '1h') {
			setMuteFor(time._1h);
			setMuteUntil(new Date(Date.now() + time._1h));
		} else if (value === '6h') {
			setMuteFor(time._6h);
			setMuteUntil(new Date(Date.now() + time._6h));
		} else if (value === '12h') {
			setMuteFor(time._12h);
			setMuteUntil(new Date(Date.now() + time._12h));
		} else if (value === '1d') {
			setMuteFor(time._1d);
			setMuteUntil(new Date(Date.now() + time._1d));
		} else if (value === '7d') {
			setMuteFor(time._7d);
			setMuteUntil(new Date(Date.now() + time._7d));
		} else if (value === '14d') {
			setMuteFor(time._14d);
			setMuteUntil(new Date(Date.now() + time._14d));
		} else if (value === '30d') {
			setMuteFor(time._30d);
			setMuteUntil(new Date(Date.now() + time._30d));
		} else if (value === '90d') {
			setMuteFor(time._90d);
			setMuteUntil(new Date(Date.now() + time._90d));
		} else if (value === '180d') {
			setMuteFor(time._180d);
			setMuteUntil(new Date(Date.now() + time._180d));
		} else if (value === '365d') {
			setMuteFor(time._365d);
			setMuteUntil(new Date(Date.now() + time._365d));
		} else if (value === 'Infinity') {
			setMuteFor(time._infinity);
			setMuteUntil(new Date(time._infinity));
		}
	}

	function handleCancel() {
		setMuteFor(time._5m);
		setMuteUntil(new Date(Date.now() + time._5m));
		dialogHandler();
	}

	async function handleSave() {
		await api
			.put(`/rooms/${room.id}/mute/${user.id}`, { mute_until: muteUntil })
			.then(() => {
				mutateRoom();
				dialogHandler();
			})
			.catch(() => {
				// error
			});
	}

	return (
		<Dialog
			open={dialogStatus}
			handler={dialogHandler}
			animate={{
				mount: { scale: 1, y: 0 },
				unmount: { scale: 0.9, y: -100 }
			}}
		>
			<DialogHeader className="justify-center">Mute</DialogHeader>
			<DialogBody className="flex justify-around  items-center p-8" divider>
				<div className="mr-8">
					<Select label="Mute for" value="5m" onChange={handleMuteDialogSelect}>
						<Option value="5m">5 minutes</Option>
						<Option value="30m">30 minutes</Option>
						<Option value="1h">1 hour</Option>
						<Option value="6h">6 hours</Option>
						<Option value="12h">12 hours</Option>
						<Option value="1d">1 day</Option>
						<Option value="7d">7 days</Option>
						<Option value="14d">14 days</Option>
						<Option value="30d">30 days</Option>
						<Option value="90d">90 days</Option>
						<Option value="180d">180 days</Option>
						<Option value="365d">365 days</Option>
						<Option value="Infinity">Forever</Option>
					</Select>
				</div>
				<div>
					{muteFor === time._infinity ? (
						<Typography className="text-center" variant="h6">
							<span className="text-blue-500">{user.username}</span> will be muted <span className="text-red-500">forever</span>.
						</Typography>
					) : (
						<Typography className="text-center" variant="h6">
							<span className="text-blue-500">{user.username}</span> will be muted until{' '}
							<span className="text-red-500">
								{muteUntil.toLocaleTimeString('en-US', {
									month: '2-digit',
									day: '2-digit',
									year: 'numeric',
									hour: '2-digit',
									minute: '2-digit',
									second: '2-digit'
								})}
							</span>
							.
						</Typography>
					)}
				</div>
			</DialogBody>
			<DialogFooter className="justify-center">
				<Button variant="text" color="red" onClick={handleCancel} className="mr-1">
					<span>Cancel</span>
				</Button>
				<Button variant="gradient" color="green" onClick={handleSave}>
					<span>Confirm</span>
				</Button>
			</DialogFooter>
		</Dialog>
	);
}

const MenuRoomItems = forwardRef((props: any, ref: any) => {
	const { me, user, room_id, ...otherProps }: { me: i_me; user: i_user; room_id: number; otherProps?: any } = props;
	const {
		room,
		mutate: mutateRoom,
		isLoading: isLoadingRoom,
		error: errorRoom
	}: { isLoading: boolean; room: i_room; mutate: KeyedMutator<i_room>; error: Error } = useRoom(room_id);
	const [openMuteDialog, setOpenMuteDialog] = useState(false);
	const api = useApi();

	if (isLoadingRoom) {
		return (
			<>
				<hr ref={ref} {...otherProps} className="my-2 border-blue-gray-50 bg-white outline-none" />
				<div ref={ref} {...otherProps} className="flex justify-around p-2 outline-none">
					<Spinner />
				</div>
			</>
		);
	}
	if (errorRoom) {
		// error
		return (
			<>
				<hr ref={ref} {...otherProps} className="my-2 border-blue-gray-50 outline-none" />
				<div
					ref={ref}
					{...otherProps}
					className="flex justify-around p-2 rounded-md text-red-500 outline-none hover:text-red-900 bg-white hover:!bg-red-50 hover:bg-opacity-80"
					onClick={() => mutateRoom()}
				>
					<ExclamationTriangleIcon strokeWidth={2} className="h-6 w-6 text-red-500" />
				</div>
			</>
		);
	}

	const isMeOwnerOfRoom = room.members.some((m: i_member) => m.user.id === me.id && m.role === e_member_role.OWNER);
	const isMeAdminOfRoom = room.members.some((m: i_member) => m.user.id === me.id && m.role === e_member_role.ADMIN);
	const isUserOwnerOfRoom = room.members.some((m: i_member) => m.user.id === user.id && m.role === e_member_role.OWNER);
	const isUserAdminOfRoom = room.members.some((m: i_member) => m.user.id === user.id && m.role === e_member_role.ADMIN);
	const isUserMuted = room.members.some((m: i_member) => m.user.id === user.id && m.muted === true);
	const isUserBanned = room.members.some((m: i_member) => m.user.id === user.id && m.banned === true);

	const hidePromote = !isMeOwnerOfRoom || isUserAdminOfRoom || isUserBanned || isUserOwnerOfRoom;
	const hideDemote = !isMeOwnerOfRoom || !isUserAdminOfRoom || isUserBanned;
	const hideMute = (!isMeOwnerOfRoom && !isMeAdminOfRoom) || isUserMuted || isUserBanned || isUserOwnerOfRoom;
	const hideUnmute = (!isMeOwnerOfRoom && !isMeAdminOfRoom) || !isUserMuted || isUserBanned || isUserOwnerOfRoom;
	const hideKick = (!isMeOwnerOfRoom && !isMeAdminOfRoom) || isUserBanned || isUserOwnerOfRoom;
	const hideBan = (!isMeOwnerOfRoom && !isMeAdminOfRoom) || isUserBanned || isUserOwnerOfRoom;
	const hideUnban = (!isMeOwnerOfRoom && !isMeAdminOfRoom) || !isUserBanned || isUserOwnerOfRoom;

	async function handlePromote() {
		await api
			.put(`/rooms/${room_id}/promote/${user.id}`)
			.then(() => {
				mutateRoom();
			})
			.catch(() => {
				// error
			});
	}

	async function handleDemote() {
		await api
			.put(`/rooms/${room_id}/demote/${user.id}`)
			.then(() => {
				mutateRoom();
			})
			.catch(() => {
				// error
			});
	}

	function handleMute() {
		setOpenMuteDialog(!openMuteDialog);
	}

	async function handleUnmute() {
		await api
			.put(`/rooms/${room_id}/unmute/${user.id}`)
			.then(() => {
				mutateRoom();
			})
			.catch(() => {
				// error
			});
	}

	async function handleKick() {
		await api
			.delete(`/rooms/${room_id}/kick/${user.id}`)
			.then(() => {
				mutateRoom();
			})
			.catch(() => {
				// error
			});
	}

	async function handleBan() {
		await api
			.put(`/rooms/${room_id}/ban/${user.id}`)
			.then(() => {
				mutateRoom();
			})
			.catch(() => {
				// error
			});
	}

	async function handleUnban() {
		await api
			.put(`/rooms/${room_id}/unban/${user.id}`)
			.then(() => {
				mutateRoom();
			})
			.catch(() => {
				// error
			});
	}

	if (hidePromote && hideDemote && hideMute && hideUnmute && hideKick && hideBan && hideUnban) {
		return <></>;
	}
	return (
		<>
			<hr ref={ref} {...otherProps} className="my-2 border-blue-gray-50 outline-none" />
			<MenuItem ref={ref} {...otherProps} className={`flex items-center gap-2 outline-none ${hidePromote && 'hidden'}`} onClick={handlePromote} tabIndex={-1}>
				<SparklesIcon strokeWidth={2} className="h-4 w-4" />
				<Typography variant="small" className="font-normal">
					Promote
				</Typography>
			</MenuItem>
			<MenuItem ref={ref} {...otherProps} className={`flex items-center gap-2 outline-none ${hideDemote && 'hidden'}`} onClick={handleDemote} tabIndex={-1}>
				<SparklesIcon strokeWidth={2} className="h-4 w-4" />
				<Typography variant="small" className="font-normal">
					Demote
				</Typography>
			</MenuItem>
			<MenuItem ref={ref} {...otherProps} className={`flex items-center gap-2 outline-none ${hideMute && 'hidden'}`} onClick={handleMute} tabIndex={-1}>
				<SpeakerXMarkIcon strokeWidth={2} className="h-4 w-4" />
				<Typography variant="small" className="font-normal">
					Mute
				</Typography>
			</MenuItem>
			<MenuItem ref={ref} {...otherProps} className={`flex items-center gap-2 outline-none ${hideUnmute && 'hidden'}`} onClick={handleUnmute} tabIndex={-1}>
				<SpeakerWaveIcon strokeWidth={2} className="h-4 w-4" />
				<Typography variant="small" className="font-normal">
					Unmute
				</Typography>
			</MenuItem>
			<MenuItem ref={ref} {...otherProps} className={`flex items-center gap-2 outline-none ${hideKick && 'hidden'}`} onClick={handleKick} tabIndex={-1}>
				<ArrowLeftOnRectangleIcon strokeWidth={2} className="h-4 w-4" />
				<Typography variant="small" className="font-normal">
					Kick
				</Typography>
			</MenuItem>
			<MenuItem ref={ref} {...otherProps} className={`flex items-center gap-2 outline-none ${hideBan && 'hidden'}`} onClick={handleBan} tabIndex={-1}>
				<ScaleIcon strokeWidth={2} className="h-4 w-4" />
				<Typography variant="small" className="font-normal">
					Ban
				</Typography>
			</MenuItem>
			<MenuItem ref={ref} {...otherProps} className={`flex items-center gap-2 outline-none ${hideUnban && 'hidden'}`} onClick={handleUnban} tabIndex={-1}>
				<ScaleIcon strokeWidth={2} className="h-4 w-4" />
				<Typography variant="small" className="font-normal">
					Unban
				</Typography>
			</MenuItem>
			<MuteDialog user={user} room={room} mutateRoom={mutateRoom} dialogStatus={openMuteDialog} dialogHandler={handleMute} />
		</>
	);
});

export function User({ room_id, login42, clickable = true }: { room_id?: number; login42: string; clickable?: boolean }) {
	const { me, mutate: mutateMe, isLoading: isLoadingMe, error: errorMe }: { isLoading: boolean; me: i_me; mutate: KeyedMutator<i_me>; error: Error } = useMe();
	const {
		user,
		mutate: mutateUser,
		isLoading: isLoadingUser,
		error: errorUser
	}: { isLoading: boolean; user: i_user; mutate: KeyedMutator<i_user>; error: Error } = useUser(login42);
	const location = useLocation();
	const navigate = useNavigate();
	const api = useApi();
	const status = getStatus(user.id);

	if (isLoadingMe || isLoadingUser) {
		return (
			<div className="flex justify-center items-center p-3 bg-white outline-none">
				<Spinner />
			</div>
		);
	}
	if (errorMe || errorUser) {
		// error
		return (
			<div
				className="flex justify-center items-center p-3 rounded-md text-red-500 outline-none hover:text-red-900 bg-white hover:!bg-red-50 hover:bg-opacity-80"
				onClick={() => {
					mutateMe();
					mutateUser();
				}}
			>
				<ExclamationTriangleIcon strokeWidth={2} className="h-12 w-12" />
			</div>
		);
	}

	if (!clickable) {
		return <UserUI username={user.username} avatar={user.avatar} status={status} />;
	}

	const invitableRooms = me.memberOf.filter((m: i_member) => m.role === e_member_role.OWNER || m.role === e_member_role.ADMIN);

	const isMeUser = me.id === user.id;
	const isCurrentLocationMeProfile = location.pathname === `/dashboard/users/${user.id}` || location.pathname === `/dashboard/users/${user.login42}`;
	const areMeAndUserFriends = me.friends.some((f: i_friends) => f.userB.id === user.id);
	const hasMeOneInvitableRooms = invitableRooms.length > 0;

	const meSentFriendRequestToUser = me.friendRequestsSent.some((f: i_friend_requests) => f.userB.id === user.id);
	const userSentFriendRequestToMe = me.friendRequestsReceived.some((f: i_friend_requests) => f.userB.id === me.id);
	const meBlockUser = me.blocked.some((f: i_blocked) => f.userB.id === user.id);
	const userBlockMe = me.blockedBy.some((f: i_blocked) => f.userB.id === me.id);

	const hideAll = isMeUser;

	const disableProfile = isCurrentLocationMeProfile || meBlockUser || userBlockMe;
	const disableSendMessage = !areMeAndUserFriends || meBlockUser || userBlockMe;
	const disableInviteToRoom = !areMeAndUserFriends || !hasMeOneInvitableRooms || meBlockUser || userBlockMe;
	const disableInviteToGame = !areMeAndUserFriends || true /* !isMeInGame */ || meBlockUser || userBlockMe;

	const hideSendFriendRequest = areMeAndUserFriends || meSentFriendRequestToUser || userSentFriendRequestToMe || meBlockUser || userBlockMe;
	const hideCancelFriendRequest = areMeAndUserFriends || !meSentFriendRequestToUser || meBlockUser || userBlockMe;
	const hideAcceptFriendRequest = areMeAndUserFriends || !userSentFriendRequestToMe || meBlockUser || userBlockMe;
	const hideRejectFriendRequest = areMeAndUserFriends || !userSentFriendRequestToMe || meBlockUser || userBlockMe;
	const hideRemoveFriend = !areMeAndUserFriends;
	const hideBlock = meBlockUser;
	const hideUnblock = !meBlockUser;

	function handleProfile() {
		navigate(`/dashboard/users/${user.login42}`);
	}

	// Send Message

	// Invite to Room

	// Invite to Game

	async function handleSendFriendRequest() {
		await api
			.post(`/users/${user.login42}/friend/request`)
			.then(() => {
				mutateMe();
				mutateUser();
			})
			.catch(() => {
				// error
			});
	}

	async function handleCancelFriendRequest() {
		await api
			.delete(`/users/${user.login42}/friend/request`)
			.then(() => {
				mutateMe();
				mutateUser();
			})
			.catch(() => {
				// error
			});
	}

	async function handleAcceptFriendRequest() {
		await api
			.post(`/users/${user.login42}/friend/response`)
			.then(() => {
				mutateMe();
				mutateUser();
			})
			.catch(() => {
				// error
			});
	}

	async function handleRejectFriendRequest() {
		await api
			.delete(`/users/${user.login42}/friend/response`)
			.then(() => {
				mutateMe();
				mutateUser();
			})
			.catch(() => {
				// error
			});
	}

	async function handleRemoveFriend() {
		await api
			.delete(`/users/${user.login42}/friend`)
			.then(() => {
				mutateMe();
				mutateUser();
			})
			.catch(() => {
				// error
			});
	}

	async function handleBlock() {
		await api
			.post(`/users/${user.login42}/block`)
			.then(() => {
				mutateMe();
				mutateUser();
			})
			.catch(() => {
				// error
			});
	}

	async function handleUnblock() {
		await api
			.delete(`/users/${user.login42}/block`)
			.then(() => {
				mutateMe();
				mutateUser();
			})
			.catch(() => {
				// error
			});
	}

	return (
		<Menu>
			<MenuHandler>
				<UserUI username={user.username} avatar={user.avatar} status={status} />
			</MenuHandler>
			<MenuList className={`${hideAll && 'hidden'}`}>
				<MenuItem className="flex items-center gap-2 outline-none" disabled={disableProfile} onClick={handleProfile} tabIndex={-1}>
					<UserCircleIcon strokeWidth={2} className="h-4 w-4" />
					<Typography variant="small" className="font-normal">
						{user.username}'s Profile
					</Typography>
				</MenuItem>
				<MenuItem className="flex items-center gap-2 outline-none" disabled={disableSendMessage} tabIndex={-1}>
					<ChatBubbleOvalLeftEllipsisIcon strokeWidth={2} className="h-4 w-4" />
					<Typography variant="small" className="font-normal">
						Send Message
					</Typography>
				</MenuItem>
				<Menu placement="right-start" offset={15}>
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
							<MenuItem key={m.room.id} className="flex items-center gap-2 outline-none" tabIndex={-1}>
								{m.room.name}
							</MenuItem>
						))}
					</MenuList>
				</Menu>
				<MenuItem className="flex items-center gap-2 outline-none" disabled={disableInviteToGame} tabIndex={-1}>
					<RocketLaunchIcon strokeWidth={2} className="h-4 w-4" />
					<Typography variant="small" className="font-normal">
						Invite to Game
					</Typography>
				</MenuItem>
				{room_id && <MenuRoomItems me={me} user={user} room_id={room_id} />}
				<hr className="my-2 border-blue-gray-50" />
				<MenuItem className={`flex items-center gap-2 outline-none ${hideSendFriendRequest && 'hidden'}`} onClick={handleSendFriendRequest} tabIndex={-1}>
					<UserPlusIcon strokeWidth={2} className="h-4 w-4" />
					<Typography variant="small" className="font-normal">
						Send Friend Request
					</Typography>
				</MenuItem>
				<MenuItem className={`flex items-center gap-2 outline-none ${hideCancelFriendRequest && 'hidden'}`} onClick={handleCancelFriendRequest} tabIndex={-1}>
					<UserMinusIcon strokeWidth={2} className="h-4 w-4" />
					<Typography variant="small" className="font-normal">
						Cancel Friend Request
					</Typography>
				</MenuItem>
				<MenuItem className={`flex items-center gap-2 outline-none ${hideAcceptFriendRequest && 'hidden'}`} onClick={handleAcceptFriendRequest} tabIndex={-1}>
					<UserPlusIcon strokeWidth={2} className="h-4 w-4" />
					<Typography variant="small" className="font-normal">
						Accept Friend Request
					</Typography>
				</MenuItem>
				<MenuItem className={`flex items-center gap-2 outline-none ${hideRejectFriendRequest && 'hidden'}`} onClick={handleRejectFriendRequest} tabIndex={-1}>
					<UserMinusIcon strokeWidth={2} className="h-4 w-4" />
					<Typography variant="small" className="font-normal">
						Reject Friend Request
					</Typography>
				</MenuItem>
				<MenuItem className={`flex items-center gap-2 outline-none ${hideRemoveFriend && 'hidden'}`} onClick={handleRemoveFriend} tabIndex={-1}>
					<UserMinusIcon strokeWidth={2} className="h-4 w-4" />
					<Typography variant="small" className="font-normal">
						Remove Friend
					</Typography>
				</MenuItem>
				<MenuItem className={`flex items-center gap-2 outline-none ${hideBlock && 'hidden'}`} onClick={handleBlock} tabIndex={-1}>
					<HandRaisedIcon strokeWidth={2} className="h-4 w-4" />
					<Typography variant="small" className="font-normal">
						Block User
					</Typography>
				</MenuItem>
				<MenuItem className={`flex items-center gap-2 outline-none ${hideUnblock && 'hidden'}`} onClick={handleUnblock} tabIndex={-1}>
					<HandThumbUpIcon strokeWidth={2} className="h-4 w-4" />
					<Typography variant="small" className="font-normal">
						Unblock User
					</Typography>
				</MenuItem>
			</MenuList>
		</Menu>
	);
}
