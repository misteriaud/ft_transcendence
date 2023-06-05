import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyedMutator } from 'swr';
import { Button, Input, List, ListItem, Navbar, Spinner, Typography } from '@material-tailwind/react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { i_user } from './interfaces';
import { useUsers } from '../hooks/useUser';
import { UserUI } from './userUI';
import { Me } from './me';

export function Navigation() {
	const {
		users,
		mutate: mutateUsers,
		isLoading: isLoadingUsers,
		error: errorUsers
	}: { users: i_user[]; mutate: KeyedMutator<i_user[]>; isLoading: boolean; error: Error } = useUsers();
	const [openMenu, setOpenMenu] = useState(false);
	const [filter, setFilter] = useState('');
	const navigate = useNavigate();

	const filteredUsers = users.filter((u: i_user) => u.username.toLowerCase().includes(filter) || u.login42.toLowerCase().includes(filter));

	if (isLoadingUsers) {
		return (
			<>
				<Spinner />
			</>
		);
	}
	if (errorUsers) {
		// error
		return <></>;
	}

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
		<Navbar className="grid grid-cols-3 gap-4 p-2" style={{ gridTemplateColumns: '2fr 1fr 2fr' }} fullWidth={true}>
			<div className="col-start-1 col-span-1 flex justify-start items-center">
				<Input
					containerProps={{ className: 'min-w-[150px] w-80' }}
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
							<ListItem className="p-0" onClick={() => handleUserClick(u.login42)}>
								<UserUI className="w-full" username={u.username} avatar={u.avatar} />
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
			</div>
			<div className="col-start-2 col-span-1 flex justify-center items-center">
				<Button size="lg">Play</Button>
			</div>
			<div className="col-start-3 col-span-1 flex justify-end items-center">
				<Me className="rounded-md text-blue-gray-500 hover:text-blue-gray-900 bg-white hover:bg-blue-gray-50 hover:bg-opacity-80 cursor-pointer" />
			</div>
		</Navbar>
	);
}
