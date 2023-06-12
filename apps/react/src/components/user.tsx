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
import { size } from '@material-tailwind/react/types/components/avatar';
import { getStatus } from '../hooks/useContext';

/*
The Menu component behaves as if its allowHover props is set to true when defined inside a Dialog component.
See :
https://github.com/creativetimofficial/material-tailwind/issues/306
The commit 0f24a1504b0e9265819ecaf9548c1c39582322f3 corrects this problem by manually defining the functions handleMenu to open and close the Menu, handleOutsidePress to close the menu on clicking outside it and handleMenuClose which is used on each MenuItem to close the menu.
Unfortunately, closing the menu when the escape key is pressed doesn't work with this fix. In addition, a warning appeared in the console. This warning should be ignored, as it is once again a Menu component error when using the dismiss props.
See :
https://github.com/creativetimofficial/material-tailwind/issues/302
*/
export function User({
	room_id,
	login42,
	inverse,
	ignoreHoverStyle,
	className,
	size = 'sm',
	onClick
}: {
	room_id?: number;
	login42: string;
	inverse?: boolean;
	ignoreHoverStyle?: boolean;
	className?: string;
	size?: size;
	onClick?: (e: any) => void;
}) {
	const { me, mutate: mutateMe, isLoading: isLoadingMe, error: errorMe }: { isLoading: boolean; me: i_me; mutate: KeyedMutator<i_me>; error: Error } = useMe();
	const {
		user,
		mutate: mutateUser,
		isLoading: isLoadingUser,
		error: errorUser
	}: { isLoading: boolean; user: i_user; mutate: KeyedMutator<i_user>; error: Error } = useUser(login42);
	const status = getStatus(user?.id);
	const [MenuStatus, setMenuStatus] = useState(false);
	const [openMuteDialog, setOpenMuteDialog] = useState(false);

	if (isLoadingMe || isLoadingUser) {
		return (
			<div className="flex justify-center items-center p-3 bg-white outline-none">
				<Spinner className="h-10 w-10" />
			</div>
		);
	}
	if (errorMe || errorUser) {
		return (
			<div
				className="flex justify-center items-center p-3 rounded-md text-red-500 outline-none hover:text-red-900 bg-white hover:!bg-red-50 hover:bg-opacity-80"
				onClick={() => {
					mutateMe();
					mutateUser();
				}}
			>
				<ExclamationTriangleIcon strokeWidth={2} className="h-10 w-10" />
			</div>
		);
	}

	const isMeUser = me.id === user.id;

	const hideAll = isMeUser;

	function handleMenu() {
		setMenuStatus(!MenuStatus);
	}

	function handleMenuClose() {
		setMenuStatus(false);
	}

	function handleOutsidePress() {
		handleMenuClose();
		return false;
	}

	function handleOpenCloseMuteDialog() {
		setOpenMuteDialog(!openMuteDialog);
	}

	if (onClick) {
		return (
			<UserUI
				className={className}
				username={user.username}
				avatar={user.avatar}
				inverse={inverse}
				ignoreHoverStyle={true}
				size={size}
				onClick={onClick}
				status={status}
			/>
		);
	}

	return (
		<Menu open={MenuStatus} dismiss={{ outsidePress: handleOutsidePress }}>
			<MenuHandler>
				<UserUI
					className={className}
					username={user.username}
					avatar={user.avatar}
					inverse={inverse}
					ignoreHoverStyle={ignoreHoverStyle}
					size={size}
					status={status}
					onClickCapture={handleMenu}
				/>
			</MenuHandler>
			<MenuList className={`z-[10000] ${hideAll && 'hidden'}`}>
				{<MenuBaseItems me={me} user={user} menuHandler={handleMenu} />}
				{room_id && <MenuRoomItems me={me} user={user} room_id={room_id} menuHandler={handleMenu} dialogHandler={handleOpenCloseMuteDialog} />}
				{<MenuSocialItems me={me} mutateMe={mutateMe} user={user} mutateUser={mutateUser} menuHandler={handleMenu} />}
			</MenuList>
			{room_id && <MuteDialog user={user} room_id={room_id} dialogStatus={openMuteDialog} dialogHandler={handleOpenCloseMuteDialog} />}
		</Menu>
	);
}
