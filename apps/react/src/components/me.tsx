import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Avatar, Badge, Menu, MenuHandler, MenuItem, MenuList, Spinner, Typography } from '@material-tailwind/react';
import { Cog6ToothIcon, PowerIcon, UserCircleIcon, UsersIcon } from '@heroicons/react/24/solid';
import { KeyedMutator } from 'swr';
import { useStoreDispatchContext } from '../hooks/useContext';
import { StoreActionType } from '../context/storeProvider';
import { useMe } from '../hooks/useUser';
import { User } from './prisma-interfaces';
import { SettingsDialog } from './me-settings';

export function Me() {
	const { isLoading, me, mutate }: { isLoading: boolean; me: User; mutate: KeyedMutator<any> } = useMe();
	const [openMenu, setOpenMenu] = useState(false);
	const [openSettingsDialog, setOpenSettingsDialog] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();
	const dispatch = useStoreDispatchContext();

	const isCurrentLocationMeProfile =
		location.pathname === `/dashboard/users/${me.id}` || location.pathname === `/dashboard/users/${me.login42}` || location.pathname === '/dashboard/users/me';

	const disabledProfile = isCurrentLocationMeProfile;

	function handleOpenCloseMenu() {
		setOpenMenu(!openMenu);
	}

	function navigateToProfile() {
		navigate(`/dashboard/users/${me.login42}`);
	}

	function handleOpenCloseSettingsDialog() {
		setOpenSettingsDialog(!openSettingsDialog);
	}

	function signOut() {
		dispatch({
			type: StoreActionType.LOGOUT
		});
	}

	return (
		<Menu open={openMenu} handler={handleOpenCloseMenu}>
			<MenuHandler>
				<div className="flex justify-center items-center p-3 rounded-md text-blue-gray-500 hover:text-blue-gray-900 bg-white hover:bg-blue-gray-50 hover:bg-opacity-80">
					{isLoading ? (
						<Spinner />
					) : (
						<>
							<Typography variant="h5" className="font-normal px-3 py-2">
								{me.username}
							</Typography>
							<Badge overlap="circular" placement="bottom-end" color="green">
								<Avatar variant="circular" alt={me.username} className="cursor-pointer" src={`${me.avatar}?t=${Date.now()}`} />
							</Badge>
						</>
					)}
				</div>
			</MenuHandler>
			<MenuList>
				<MenuItem className="flex items-center gap-2" disabled={disabledProfile} onClick={navigateToProfile}>
					<UserCircleIcon strokeWidth={2} className="h-4 w-4" />
					<Typography variant="small" className="font-normal">
						My Profile
					</Typography>
				</MenuItem>
				<MenuItem className="flex items-center gap-2">
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
			<SettingsDialog me={me} mutate={mutate} dialogStatus={openSettingsDialog} dialogHandler={handleOpenCloseSettingsDialog} />
		</Menu>
	);
}
