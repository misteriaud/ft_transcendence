import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Avatar, Badge, Menu, MenuHandler, MenuItem, MenuList, Spinner, Typography } from '@material-tailwind/react';
import {
	ArrowLeftOnRectangleIcon,
	ChatBubbleOvalLeftEllipsisIcon,
	ExclamationTriangleIcon,
	HandRaisedIcon,
	HandThumbUpIcon,
	HomeIcon,
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

function RoomMenuItems({ me, user, room_id }: { me: i_me; user: i_user; room_id: number }) {
	const {
		room,
		mutate: mutateRoom,
		isLoading: isLoadingRoom,
		error: errorRoom
	}: { isLoading: boolean; room: i_room; mutate: KeyedMutator<i_room>; error: Error } = useRoom(room_id);
	const api = useApi();

	if (isLoadingRoom) {
		return (
			<>
				<hr className="my-2 border-blue-gray-50 bg-white" />
				<div className="flex justify-around p-2">
					<Spinner />
				</div>
			</>
		);
	}
	if (errorRoom) {
		// error
		return (
			<>
				<hr className="my-2 border-blue-gray-50" />
				<div
					className="flex justify-around p-2 rounded-md text-red-500 hover:text-red-900 bg-white hover:!bg-red-50 hover:bg-opacity-80"
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

	async function handleMute() {
		await api
			.put(`/rooms/${room_id}/mute/${user.id}`)
			.then(() => {
				mutateRoom();
			})
			.catch(() => {
				// error
			});
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
			<hr className="my-2 border-blue-gray-50" />
			<MenuItem className={`flex items-center gap-2 ${hidePromote && 'hidden'}`} onClick={handlePromote}>
				<SparklesIcon strokeWidth={2} className="h-4 w-4" />
				<Typography variant="small" className="font-normal">
					Promote
				</Typography>
			</MenuItem>
			<MenuItem className={`flex items-center gap-2 ${hideDemote && 'hidden'}`} onClick={handleDemote}>
				<SparklesIcon strokeWidth={2} className="h-4 w-4" />
				<Typography variant="small" className="font-normal">
					Demote
				</Typography>
			</MenuItem>
			<MenuItem className={`flex items-center gap-2 ${hideMute && 'hidden'}`} onClick={handleMute}>
				<SpeakerXMarkIcon strokeWidth={2} className="h-4 w-4" />
				<Typography variant="small" className="font-normal">
					Mute
				</Typography>
			</MenuItem>
			<MenuItem className={`flex items-center gap-2 ${hideUnmute && 'hidden'}`} onClick={handleUnmute}>
				<SpeakerWaveIcon strokeWidth={2} className="h-4 w-4" />
				<Typography variant="small" className="font-normal">
					Unmute
				</Typography>
			</MenuItem>
			<MenuItem className={`flex items-center gap-2 ${hideKick && 'hidden'}`} onClick={handleKick}>
				<ArrowLeftOnRectangleIcon strokeWidth={2} className="h-4 w-4" />
				<Typography variant="small" className="font-normal">
					Kick
				</Typography>
			</MenuItem>
			<MenuItem className={`flex items-center gap-2 ${hideBan && 'hidden'}`} onClick={handleBan}>
				<ScaleIcon strokeWidth={2} className="h-4 w-4" />
				<Typography variant="small" className="font-normal">
					Ban
				</Typography>
			</MenuItem>
			<MenuItem className={`flex items-center gap-2 ${hideUnban && 'hidden'}`} onClick={handleUnban}>
				<ScaleIcon strokeWidth={2} className="h-4 w-4" />
				<Typography variant="small" className="font-normal">
					Unban
				</Typography>
			</MenuItem>
		</>
	);
}

export function User({ room_id, login42 }: { room_id?: number; login42: string }) {
	const { me, mutate: mutateMe, isLoading: isLoadingMe, error: errorMe }: { isLoading: boolean; me: i_me; mutate: KeyedMutator<i_me>; error: Error } = useMe();
	const {
		user,
		mutate: mutateUser,
		isLoading: isLoadingUser,
		error: errorUser
	}: { isLoading: boolean; user: i_user; mutate: KeyedMutator<i_user>; error: Error } = useUser(login42);
	const [openMenu, setOpenMenu] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();
	const api = useApi();

	if (isLoadingMe || isLoadingUser) {
		return (
			<div className="flex justify-center items-center p-3 bg-white">
				<Spinner />
			</div>
		);
	}
	if (errorMe || errorUser) {
		// error
		return (
			<div
				className="flex justify-center items-center p-3 rounded-md text-red-500 hover:text-red-900 bg-white hover:!bg-red-50 hover:bg-opacity-80"
				onClick={() => {
					mutateMe();
					mutateUser();
				}}
			>
				<ExclamationTriangleIcon strokeWidth={2} className="h-12 w-12" />
			</div>
		);
	}

	const meAdminOrOwnerOfRooms = me.memberOf.filter((m: i_member) => m.role === e_member_role.OWNER || m.role === e_member_role.ADMIN);

	const isMeUser = me.id === user.id;
	const isCurrentLocationMeProfile = location.pathname === `/dashboard/users/${user.id}` || location.pathname === `/dashboard/users/${user.login42}`;
	const areMeAndUserFriends = me.friends.some((f: i_friends) => f.userB.id === user.id);
	const isMeAdminOrOwnerOfOneRoom = meAdminOrOwnerOfRooms.length > 0;
	const meSentFriendRequestToUser = me.friendRequestsSent.some((f: i_friend_requests) => f.userB.id === user.id);
	const userSentFriendRequestToMe = me.friendRequestsReceived.some((f: i_friend_requests) => f.userB.id === me.id);
	const meBlockUser = me.blocked.some((f: i_blocked) => f.userB.id === user.id);
	const userBlockMe = me.blockedBy.some((f: i_blocked) => f.userB.id === me.id);

	const hideAll = isMeUser;
	const disableProfile = isCurrentLocationMeProfile || meBlockUser || userBlockMe;
	const disableSendMessage = !areMeAndUserFriends || meBlockUser || userBlockMe;
	const disableInviteToRoom = !areMeAndUserFriends || !isMeAdminOrOwnerOfOneRoom || meBlockUser || userBlockMe;
	const hideSendFriendRequest = areMeAndUserFriends || meSentFriendRequestToUser || userSentFriendRequestToMe || meBlockUser || userBlockMe;
	const hideCancelFriendRequest = areMeAndUserFriends || !meSentFriendRequestToUser || meBlockUser || userBlockMe;
	const hideAcceptFriendRequest = areMeAndUserFriends || !userSentFriendRequestToMe || meBlockUser || userBlockMe;
	const hideRejectFriendRequest = areMeAndUserFriends || !userSentFriendRequestToMe || meBlockUser || userBlockMe;
	const hideRemoveFriend = !areMeAndUserFriends;
	const hideBlock = meBlockUser;
	const hideUnblock = !meBlockUser;

	function handleOpenCloseMenu() {
		setOpenMenu(!openMenu);
	}

	function handleProfile() {
		navigate(`/dashboard/users/${user.login42}`);
	}

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
		<Menu open={openMenu} handler={handleOpenCloseMenu}>
			<MenuHandler>
				<div className="flex justify-center items-center p-3 rounded-md text-blue-gray-500 hover:text-blue-gray-900 bg-white hover:bg-blue-gray-50 hover:bg-opacity-80">
					<Typography variant="h5" className="font-normal px-3 py-2">
						{user.username}
					</Typography>
					<Badge overlap="circular" placement="bottom-end" color="green">
						<Avatar variant="circular" alt={user.username} className="cursor-pointer" src={`${user.avatar}?t=${Date.now()}`} />
					</Badge>
				</div>
			</MenuHandler>
			<MenuList className={`${hideAll && 'hidden'}`}>
				<MenuItem className="flex items-center gap-2" disabled={disableProfile} onClick={handleProfile}>
					<UserCircleIcon strokeWidth={2} className="h-4 w-4" />
					<Typography variant="small" className="font-normal">
						{user.username}'s Profile
					</Typography>
				</MenuItem>
				<MenuItem className="flex items-center gap-2" disabled={disableSendMessage}>
					<ChatBubbleOvalLeftEllipsisIcon strokeWidth={2} className="h-4 w-4" />
					<Typography variant="small" className="font-normal">
						Send Message
					</Typography>
				</MenuItem>
				<Menu placement="right-start" offset={15}>
					<MenuHandler>
						<MenuItem className="flex items-center gap-2" disabled={disableInviteToRoom}>
							<HomeIcon strokeWidth={2} className="h-4 w-4" />
							<Typography variant="small" className="font-normal">
								Invite to Room
							</Typography>
						</MenuItem>
					</MenuHandler>
					<MenuList>
						{meAdminOrOwnerOfRooms.map((item: any) => (
							<MenuItem className="flex items-center gap-2">{item.room.name}</MenuItem>
						))}
					</MenuList>
				</Menu>
				{room_id && <RoomMenuItems me={me} user={user} room_id={room_id} />}
				<hr className="my-2 border-blue-gray-50" />
				<MenuItem className={`flex items-center gap-2 ${hideSendFriendRequest && 'hidden'}`} onClick={handleSendFriendRequest}>
					<UserPlusIcon strokeWidth={2} className="h-4 w-4" />
					<Typography variant="small" className="font-normal">
						Send Friend Request
					</Typography>
				</MenuItem>
				<MenuItem className={`flex items-center gap-2 ${hideCancelFriendRequest && 'hidden'}`} onClick={handleCancelFriendRequest}>
					<UserMinusIcon strokeWidth={2} className="h-4 w-4" />
					<Typography variant="small" className="font-normal">
						Cancel Friend Request
					</Typography>
				</MenuItem>
				<MenuItem className={`flex items-center gap-2 ${hideAcceptFriendRequest && 'hidden'}`} onClick={handleAcceptFriendRequest}>
					<UserPlusIcon strokeWidth={2} className="h-4 w-4" />
					<Typography variant="small" className="font-normal">
						Accept Friend Request
					</Typography>
				</MenuItem>
				<MenuItem className={`flex items-center gap-2 ${hideRejectFriendRequest && 'hidden'}`} onClick={handleRejectFriendRequest}>
					<UserMinusIcon strokeWidth={2} className="h-4 w-4" />
					<Typography variant="small" className="font-normal">
						Reject Friend Request
					</Typography>
				</MenuItem>
				<MenuItem className={`flex items-center gap-2 ${hideRemoveFriend && 'hidden'}`} onClick={handleRemoveFriend}>
					<UserMinusIcon strokeWidth={2} className="h-4 w-4" />
					<Typography variant="small" className="font-normal">
						Remove Friend
					</Typography>
				</MenuItem>
				<MenuItem className={`flex items-center gap-2 ${hideBlock && 'hidden'}`} onClick={handleBlock}>
					<HandRaisedIcon strokeWidth={2} className="h-4 w-4" />
					<Typography variant="small" className="font-normal">
						Block User
					</Typography>
				</MenuItem>
				<MenuItem className={`flex items-center gap-2 ${hideUnblock && 'hidden'}`} onClick={handleUnblock}>
					<HandThumbUpIcon strokeWidth={2} className="h-4 w-4" />
					<Typography variant="small" className="font-normal">
						Unblock User
					</Typography>
				</MenuItem>
			</MenuList>
		</Menu>
	);
}
