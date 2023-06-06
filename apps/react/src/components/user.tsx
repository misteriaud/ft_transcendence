import { useState } from 'react';
import { Menu, MenuHandler, MenuList, Spinner } from '@material-tailwind/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { KeyedMutator } from 'swr';
import { i_me, i_user } from './interfaces';
import { useMe, useUser } from '../hooks/useUser';
import { UserUI } from './userUI';
import { MenuBaseItems } from './user-base';
import { MenuRoomItems } from './user-room';
import { MenuSocialItems } from './user-social';
import { MuteDialog } from './user-room-mute';
import { useNotifyError } from '../hooks/notifications';

export function User({ room_id, login42 }: { room_id?: number; login42: string }) {
	const { me, mutate: mutateMe, isLoading: isLoadingMe, error: errorMe }: { isLoading: boolean; me: i_me; mutate: KeyedMutator<i_me>; error: Error } = useMe();
	const {
		user,
		mutate: mutateUser,
		isLoading: isLoadingUser,
		error: errorUser
	}: { isLoading: boolean; user: i_user; mutate: KeyedMutator<i_user>; error: Error } = useUser(login42);
	const [openMuteDialog, setOpenMuteDialog] = useState(false);
	const notifyError = useNotifyError();

	if (isLoadingMe || isLoadingUser) {
		return (
			<div className="flex justify-center items-center p-3 bg-white outline-none">
				<Spinner />
			</div>
		);
	}
	if (errorMe || errorUser) {
		notifyError();
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

	const isMeUser = me.id === user.id;

	const hideAll = isMeUser;

	function handleOpenCloseMuteDialog() {
		setOpenMuteDialog(!openMuteDialog);
	}

	return (
		<Menu>
			<MenuHandler>
				<UserUI username={user.username} avatar={user.avatar} status={status} />
			</MenuHandler>
			<MenuList className={`${hideAll && 'hidden'}`}>
				{<MenuBaseItems me={me} user={user} />}
				{room_id && <MenuRoomItems me={me} user={user} room_id={room_id} dialogHandler={handleOpenCloseMuteDialog} />}
				{<MenuSocialItems me={me} mutateMe={mutateMe} user={user} mutateUser={mutateUser} />}
			</MenuList>
			{room_id && <MuteDialog user={user} room_id={room_id} dialogStatus={openMuteDialog} dialogHandler={handleOpenCloseMuteDialog} />}
		</Menu>
	);
}
