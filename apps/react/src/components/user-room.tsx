import { forwardRef } from 'react';
import { MenuItem, Spinner, Typography } from '@material-tailwind/react';
import { ArrowLeftOnRectangleIcon, ExclamationTriangleIcon, ScaleIcon, SparklesIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import { KeyedMutator } from 'swr';
import { i_me, i_member, i_room, i_user } from './interfaces';
import { e_member_role } from './interfaces';
import { useRoom } from '../hooks/useRoom';
import { useApi } from '../hooks/useApi';
import { useNotifyError, useNotifySuccess } from '../hooks/notifications';

export const MenuRoomItems = forwardRef((props: any, ref: any) => {
	const {
		me,
		user,
		room_id,
		menuHandler,
		dialogHandler,
		onClick,
		...otherProps
	}: {
		me: i_me;
		user: i_user;
		room_id: number;
		dialogHandler: any;
		menuHandler: () => void;
		onClick?: (event: React.MouseEvent<HTMLElement>) => void;
		otherProps?: any;
	} = props;
	const {
		room,
		mutate: mutateRoom,
		isLoading: isLoadingRoom,
		error: errorRoom
	}: { isLoading: boolean; room: i_room; mutate: KeyedMutator<i_room>; error: Error } = useRoom(room_id);
	const notifySuccess = useNotifySuccess();
	const notifyError = useNotifyError();
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

	async function handlePromote(onClick?: (event: React.MouseEvent<HTMLElement>) => void, e?: React.MouseEvent<HTMLElement>) {
		if (onClick && e) {
			onClick(e);
		}
		menuHandler();
		await api
			.put(`/rooms/${room_id}/promote/${user.id}`)
			.then(() => {
				mutateRoom();
				notifySuccess(`${user.username} has been promoted.`);
			})
			.catch(() => {
				notifyError();
			});
	}

	async function handleDemote(onClick?: (event: React.MouseEvent<HTMLElement>) => void, e?: React.MouseEvent<HTMLElement>) {
		if (onClick && e) {
			onClick(e);
		}
		menuHandler();
		await api
			.put(`/rooms/${room_id}/demote/${user.id}`)
			.then(() => {
				mutateRoom();
				notifySuccess(`${user.username} has been demoted.`);
			})
			.catch(() => {
				notifyError();
			});
	}

	function handleMute(onClick?: (event: React.MouseEvent<HTMLElement>) => void, e?: React.MouseEvent<HTMLElement>) {
		if (onClick && e) {
			onClick(e);
		}
		menuHandler();
		dialogHandler();
	}

	async function handleUnmute(onClick?: (event: React.MouseEvent<HTMLElement>) => void, e?: React.MouseEvent<HTMLElement>) {
		if (onClick && e) {
			onClick(e);
		}
		menuHandler();
		await api
			.put(`/rooms/${room_id}/unmute/${user.id}`)
			.then(() => {
				mutateRoom();
				notifySuccess(`${user.username} has been unmuted.`);
			})
			.catch(() => {
				notifyError();
			});
	}

	async function handleKick(onClick?: (event: React.MouseEvent<HTMLElement>) => void, e?: React.MouseEvent<HTMLElement>) {
		if (onClick && e) {
			onClick(e);
		}
		menuHandler();
		await api
			.delete(`/rooms/${room_id}/kick/${user.id}`)
			.then(() => {
				mutateRoom();
				notifySuccess(`${user.username} has been kicked.`);
			})
			.catch(() => {
				notifyError();
			});
	}

	async function handleBan(onClick?: (event: React.MouseEvent<HTMLElement>) => void, e?: React.MouseEvent<HTMLElement>) {
		if (onClick && e) {
			onClick(e);
		}
		menuHandler();
		await api
			.put(`/rooms/${room_id}/ban/${user.id}`)
			.then(() => {
				mutateRoom();
				notifySuccess(`${user.username} has been banned.`);
			})
			.catch(() => {
				notifyError();
			});
	}

	async function handleUnban(onClick?: (event: React.MouseEvent<HTMLElement>) => void, e?: React.MouseEvent<HTMLElement>) {
		if (onClick && e) {
			onClick(e);
		}
		menuHandler();
		await api
			.put(`/rooms/${room_id}/unban/${user.id}`)
			.then(() => {
				mutateRoom();
				notifySuccess(`${user.username} has been unbanned.`);
			})
			.catch(() => {
				notifyError();
			});
	}

	if (hidePromote && hideDemote && hideMute && hideUnmute && hideKick && hideBan && hideUnban) {
		return <></>;
	}
	return (
		<>
			<hr ref={ref} {...otherProps} className="my-2 border-blue-gray-50 outline-none" />
			<MenuItem
				ref={ref}
				{...otherProps}
				className={`flex items-center gap-2 outline-none ${hidePromote && 'hidden'}`}
				onClick={(e) => handlePromote(onClick, e)}
				tabIndex={-1}
			>
				<SparklesIcon strokeWidth={2} className="h-4 w-4" />
				<Typography variant="small" className="font-normal">
					Promote
				</Typography>
			</MenuItem>
			<MenuItem
				ref={ref}
				{...otherProps}
				className={`flex items-center gap-2 outline-none ${hideDemote && 'hidden'}`}
				onClick={(e) => handleDemote(onClick, e)}
				tabIndex={-1}
			>
				<SparklesIcon strokeWidth={2} className="h-4 w-4" />
				<Typography variant="small" className="font-normal">
					Demote
				</Typography>
			</MenuItem>
			<MenuItem
				ref={ref}
				{...otherProps}
				className={`flex items-center gap-2 outline-none ${hideMute && 'hidden'}`}
				onClick={(e) => handleMute(onClick, e)}
				tabIndex={-1}
			>
				<SpeakerXMarkIcon strokeWidth={2} className="h-4 w-4" />
				<Typography variant="small" className="font-normal">
					Mute
				</Typography>
			</MenuItem>
			<MenuItem
				ref={ref}
				{...otherProps}
				className={`flex items-center gap-2 outline-none ${hideUnmute && 'hidden'}`}
				onClick={(e) => handleUnmute(onClick, e)}
				tabIndex={-1}
			>
				<SpeakerWaveIcon strokeWidth={2} className="h-4 w-4" />
				<Typography variant="small" className="font-normal">
					Unmute
				</Typography>
			</MenuItem>
			<MenuItem
				ref={ref}
				{...otherProps}
				className={`flex items-center gap-2 outline-none ${hideKick && 'hidden'}`}
				onClick={(e) => handleKick(onClick, e)}
				tabIndex={-1}
			>
				<ArrowLeftOnRectangleIcon strokeWidth={2} className="h-4 w-4" />
				<Typography variant="small" className="font-normal">
					Kick
				</Typography>
			</MenuItem>
			<MenuItem
				ref={ref}
				{...otherProps}
				className={`flex items-center gap-2 outline-none ${hideBan && 'hidden'}`}
				onClick={(e) => handleBan(onClick, e)}
				tabIndex={-1}
			>
				<ScaleIcon strokeWidth={2} className="h-4 w-4" />
				<Typography variant="small" className="font-normal">
					Ban
				</Typography>
			</MenuItem>
			<MenuItem
				ref={ref}
				{...otherProps}
				className={`flex items-center gap-2 outline-none ${hideUnban && 'hidden'}`}
				onClick={(e) => handleUnban(onClick, e)}
				tabIndex={-1}
			>
				<ScaleIcon strokeWidth={2} className="h-4 w-4" />
				<Typography variant="small" className="font-normal">
					Unban
				</Typography>
			</MenuItem>
		</>
	);
});
