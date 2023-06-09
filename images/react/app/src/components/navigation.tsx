import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyedMutator } from 'swr';
import { IconButton, Input, List, ListItem, Navbar, Spinner, Typography } from '@material-tailwind/react';
import { ExclamationTriangleIcon, HomeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { i_user } from './interfaces';
import { useUsers } from '../hooks/useUser';
import { UserUI } from './userUI';
import { Me } from './me';
import { GameButton } from '../components/Queue';
import { PresenceContext } from '../context/storeProvider';
import { InvitationButton } from './invitationButton';

export function SearchBar() {
	const {
		users,
		mutate: mutateUsers,
		isLoading: isLoadingUsers,
		error: errorUsers
	}: { users: i_user[]; mutate: KeyedMutator<i_user[]>; isLoading: boolean; error: Error } = useUsers();
	const [openMenu, setOpenMenu] = useState(false);
	const [filter, setFilter] = useState('');
	const navigate = useNavigate();
	const presences = useContext(PresenceContext);

	if (isLoadingUsers) {
		return (
			<>
				<Input
					containerProps={{ className: 'min-w-[150px] max-w-[320px]' }}
					label="Search for users"
					icon={<MagnifyingGlassIcon strokeWidth={2} className="h-4 w-4" />}
					onFocus={handleSearchBarFocus}
					onBlur={handleSearchBarBlur}
					onChange={handleSearchBarChange}
				/>
				<List
					className={`absolute top-16 w-80 max-h-[50vh] border border-blue-gray-50 rounded-md bg-white shadow-lg shadow-blue-gray-500/10 overflow-scroll transition-all ${
						!openMenu && 'invisible'
					}`}
					style={{
						transformOrigin: 'center top 0px',
						transform: openMenu ? 'scale(1)' : 'scale(0.98)',
						opacity: openMenu ? '1' : '0.8'
					}}
				>
					<ListItem className="justify-center pointer-events-none">
						<Spinner className="h-8 w-8" />
					</ListItem>
				</List>
			</>
		);
	}
	if (errorUsers) {
		return (
			<>
				<Input
					containerProps={{ className: 'min-w-[150px] max-w-[320px]' }}
					label="Search for users"
					icon={<MagnifyingGlassIcon strokeWidth={2} className="h-4 w-4" />}
					onFocus={handleSearchBarFocus}
					onBlur={handleSearchBarBlur}
					onChange={handleSearchBarChange}
				/>
				<List
					className={`absolute top-16 w-80 max-h-[50vh] border border-blue-gray-50 rounded-md bg-white shadow-lg shadow-blue-gray-500/10 overflow-scroll transition-all ${
						!openMenu && 'invisible'
					}`}
					style={{
						transformOrigin: 'center top 0px',
						transform: openMenu ? 'scale(1)' : 'scale(0.98)',
						opacity: openMenu ? '1' : '0.8'
					}}
				>
					<ListItem
						className="flex justify-around rounded-md text-red-500 outline-none hover:text-red-900 bg-white hover:!bg-red-50 hover:bg-opacity-80"
						onClick={() => mutateUsers()}
					>
						<ExclamationTriangleIcon strokeWidth={2} className="h-8 w-8 text-red-500" />
					</ListItem>
				</List>
			</>
		);
	}

	const filteredUsers = users.filter((u: i_user) => u.username.toLowerCase().includes(filter) || u.login42.toLowerCase().includes(filter));

	function handleSearchBarFocus() {
		setOpenMenu(true);
	}

	function handleSearchBarBlur() {
		setOpenMenu(false);
	}

	function handleSearchBarChange(e: React.ChangeEvent<HTMLInputElement>) {
		setFilter(e.target.value.toLowerCase());
	}

	function handleUserClick(login42: string) {
		navigate(`/dashboard/users/${login42}`);
	}

	return (
		<>
			<Input
				containerProps={{ className: 'min-w-[150px] max-w-[320px]' }}
				label="Search for users"
				icon={<MagnifyingGlassIcon strokeWidth={2} className="h-4 w-4" />}
				onFocus={handleSearchBarFocus}
				onBlur={handleSearchBarBlur}
				onChange={handleSearchBarChange}
			/>
			<List
				className={`absolute top-16 w-80 max-h-[50vh] border border-blue-gray-50 rounded-md bg-white shadow-lg shadow-blue-gray-500/10 overflow-scroll transition-all ${
					!openMenu && 'invisible'
				}`}
				style={{
					transformOrigin: 'center top 0px',
					transform: openMenu ? 'scale(1)' : 'scale(0.98)',
					opacity: openMenu ? '1' : '0.8'
				}}
			>
				{filteredUsers.length > 0 ? (
					filteredUsers.map((u: i_user) => (
						<ListItem key={u.id} className="p-0" onClick={() => handleUserClick(u.login42)}>
							<UserUI className="w-full" username={u.username} avatar={u.avatar} status={presences.get(u.id)} />
						</ListItem>
					))
				) : (
					<ListItem className="pointer-events-none">
						<Typography variant="small" className="font-normal">
							No users found
						</Typography>
					</ListItem>
				)}
			</List>
		</>
	);
}

export function Navigation() {
	const navigate = useNavigate();
	return (
		<Navbar className="grid grid-cols-3 gap-4 p-2 z-[999]" style={{ gridTemplateColumns: '2fr 1fr 2fr' }} fullWidth={true}>
			<div className="col-start-1 col-span-1 flex justify-start items-center">
				<SearchBar />
			</div>
			<div className="col-start-2 col-span-1 flex justify-center items-center">
				<IconButton onClick={() => navigate('/dashboard')} variant="text">
					<HomeIcon className="h-5 w-5"></HomeIcon>
				</IconButton>
				<GameButton />
				<InvitationButton />
			</div>
			<div className="col-start-3 col-span-1 flex justify-end items-center">
				<Me inverse={true} />
			</div>
		</Navbar>
	);
}
