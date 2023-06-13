import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, MenuHandler, MenuItem, MenuList, Spinner, Typography } from '@material-tailwind/react';
import { Cog6ToothIcon, ExclamationTriangleIcon, PowerIcon, UserCircleIcon, UsersIcon } from '@heroicons/react/24/solid';
import { KeyedMutator } from 'swr';
import { getStatus, useStoreDispatchContext } from '../hooks/useContext';
import { StoreActionType } from '../context/storeProvider';
import { useMe } from '../hooks/useUser';
import { i_me } from './interfaces';
import { SettingsDialog } from './me-settings';
import { UserUI } from './userUI';
import { SocialDialog } from './SocialDialog';

export function Me({ inverse, ignoreHoverStyle, className }: { inverse?: boolean; ignoreHoverStyle?: boolean; className?: string }) {
	const { me, mutate, isLoading, error }: { isLoading: boolean; me: i_me; mutate: KeyedMutator<i_me>; error: Error } = useMe();
	const [openSettingsDialog, setOpenSettingsDialog] = useState(false);
	const [openSocialDialog, setOpenSocialDialog] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();
	const dispatch = useStoreDispatchContext();
	const status = getStatus(me.id);

	if (isLoading) {
		return (
			<div className="flex justify-center items-center p-3 bg-white">
				<Spinner />
			</div>
		);
	}
	if (error) {
		return (
			<div
				className="flex justify-center items-center p-3 rounded-md text-red-500 hover:text-red-900 bg-white hover:!bg-red-50 hover:bg-opacity-80"
				onClick={() => mutate()}
			>
				<ExclamationTriangleIcon strokeWidth={2} className="h-12 w-12" />
			</div>
		);
	}

	const isCurrentLocationMeProfile =
		location.pathname === `/dashboard/users/${me.id}` || location.pathname === `/dashboard/users/${me.login42}` || location.pathname === '/dashboard/users/me';

	const disableProfile = isCurrentLocationMeProfile;

	function handleProfile() {
		navigate(`/dashboard/users/${me.login42}`);
	}

	function handleOpenCloseSocialDialog() {
		setOpenSocialDialog(!openSocialDialog);
	}

	function handleOpenCloseSettingsDialog() {
		setOpenSettingsDialog(!openSettingsDialog);
	}

	function signOut() {
		dispatch({
			type: StoreActionType.LOGOUT
		});
		navigate('/');
	}

	return (
		<>
			<Menu placement="bottom-end">
				<MenuHandler>
					<UserUI className={className} username={me.username} avatar={me.avatar} inverse={inverse} ignoreHoverStyle={ignoreHoverStyle} status={status} />
				</MenuHandler>
				<MenuList className="z-[10000]">
					<MenuItem className="flex items-center gap-2" disabled={disableProfile} onClick={handleProfile}>
						<UserCircleIcon strokeWidth={2} className="h-4 w-4" />
						<Typography variant="small" className="font-normal">
							My Profile
						</Typography>
					</MenuItem>
					<MenuItem className="flex items-center gap-2" onClick={handleOpenCloseSocialDialog}>
						<UsersIcon strokeWidth={2} className="h-4 w-4" />
						<Typography variant="small" className="font-normal">
							Social
						</Typography>
					</MenuItem>
					<MenuItem className="flex items-center gap-2" onClick={handleOpenCloseSettingsDialog}>
						<Cog6ToothIcon strokeWidth={2} className="h-4 w-4" />
						<Typography variant="small" className="font-normal">
							Settings
						</Typography>
					</MenuItem>
					<hr className="my-2 border-blue-gray-50" />
					<MenuItem className="flex items-center gap-2 text-red-500 hover:!text-red-900 hover:!bg-red-50 hover:!bg-opacity-80" onClick={signOut}>
						<PowerIcon strokeWidth={2} className="h-4 w-4" />
						<Typography variant="small" className="font-normal">
							Sign Out
						</Typography>
					</MenuItem>
				</MenuList>
			</Menu>
			<SettingsDialog dialogStatus={openSettingsDialog} dialogHandler={handleOpenCloseSettingsDialog} />
			<SocialDialog dialogStatus={openSocialDialog} dialogHandler={handleOpenCloseSocialDialog} />
		</>
	);
}
