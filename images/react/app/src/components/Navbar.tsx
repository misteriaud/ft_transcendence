import { useState, createElement, useEffect } from 'react';
import { Typography, Button, Menu, MenuHandler, MenuList, MenuItem, Avatar, Card, IconButton } from '@material-tailwind/react';
import { UserCircleIcon, ChevronDownIcon, Cog6ToothIcon, PowerIcon, Bars2Icon, UsersIcon } from '@heroicons/react/24/outline';

// profile menu component
const profileMenuItems = [
	{
		label: 'My Profile',
		icon: UserCircleIcon
	},
	{
		label: 'Social',
		icon: UsersIcon
	},
	{
		label: 'Settings',
		icon: Cog6ToothIcon
	},
	{
		label: 'Sign Out',
		icon: PowerIcon
	}
];

function ProfileMenu() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const closeMenu = () => setIsMenuOpen(false);

	return (
		<Menu open={isMenuOpen} handler={setIsMenuOpen} placement="bottom-end">
			<MenuHandler>
				<Button variant="text" color="blue-gray" className="flex items-center gap-1 rounded-full py-0.5 pr-2 pl-0.5 lg:ml-auto">
					<Avatar
						variant="circular"
						size="sm"
						alt="candice wu"
						className="border border-blue-500 p-0.5"
						src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1480&q=80"
					/>
					<ChevronDownIcon strokeWidth={2.5} className={`h-3 w-3 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
				</Button>
			</MenuHandler>
			<MenuList className="p-1">
				{profileMenuItems.map(({ label, icon }, key) => {
					const isLastItem = key === profileMenuItems.length - 1;
					return (
						<MenuItem
							key={label}
							onClick={closeMenu}
							className={`flex items-center gap-2 rounded ${isLastItem ? 'hover:bg-red-500/10 focus:bg-red-500/10 active:bg-red-500/10' : ''}`}
						>
							{createElement(icon, {
								className: `h-4 w-4 ${isLastItem ? 'text-red-500' : ''}`,
								strokeWidth: 2
							})}
							<Typography as="span" variant="small" className="font-normal" color={isLastItem ? 'red' : 'inherit'}>
								{label}
							</Typography>
						</MenuItem>
					);
				})}
			</MenuList>
		</Menu>
	);
}

export function Navbar() {
	const [isNavOpen, setIsNavOpen] = useState(false);
	const toggleIsNavOpen = () => setIsNavOpen((cur) => !cur);

	useEffect(() => {
		window.addEventListener('resize', () => window.innerWidth >= 960 && setIsNavOpen(false));
	}, []);

	return (
		<nav className="mx-auto w-full py-4 px-8 bg-white">
			<div className="relative mx-auto flex items-center text-blue-gray-900">
				<Typography as="a" href="#" className="mr-4 ml-2 cursor-pointer py-1.5 font-medium">
					Material Tailwind
				</Typography>
				<div className="absolute top-2/4 left-2/4 hidden -translate-x-2/4 -translate-y-2/4 lg:block"></div>
				<IconButton size="sm" color="blue-gray" variant="text" onClick={toggleIsNavOpen} className="ml-auto mr-2 lg:hidden">
					<Bars2Icon className="h-6 w-6" />
				</IconButton>
				<ProfileMenu />
			</div>
			{/* <MobileNav open={isNavOpen} className="overflow-scroll">
				<NavList />
			</MobileNav> */}
		</nav>
	);
}
