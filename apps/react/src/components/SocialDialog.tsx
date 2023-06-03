import React from 'react';
import { Fragment, useState, useEffect } from 'react';
import {
	Button,
	Dialog,
	DialogBody,
	DialogFooter,
	Navbar,
	Collapse,
	Typography,
	IconButton,
	Avatar,
	Spinner,
	Tabs,
	TabsHeader,
	Tab,
	TabsBody,
	TabPanel
} from '@material-tailwind/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import defaultImg2 from '../images/pingpong-map.jpg';
import { i_blocked, e_member_role, i_friend_requests, i_friends, i_me, i_member, i_room, i_user } from './interfaces';
import { useMe, useUser } from '../hooks/useUser';
import { KeyedMutator } from 'swr';

interface SocialNavBarProps {
	navTabName: BarStatus;
	handleTabClick: (tab: BarStatus) => void;
}

function DefaultUserBlock() {
	const [userOnline, setUserOnline] = useState(true);

	return (
		<div className="relative mb-2 bg-white p-2 flex max-w-lg mx-auto items-center rounded-xl shadow-lg">
			<div className="relative">
				<Avatar src={defaultImg2} alt="avatar" size="lg" withBorder={true} className="border-4 border-gray-700" />
				<div className="absolute -top-0.5 -right-0.5 h-6 w-6 bg-white rounded-full border-2 border-gray-700">
					<span
						className={`absolute h-4 w-4 ${
							userOnline ? 'bg-green-500' : 'bg-gray-500'
						} rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}
					></span>
				</div>
			</div>
			<div className="ml-4 ml-2 flex flex-col justify-center truncate">
				<Typography variant="h6" color="blue-gray">
					UnGrandEtBeauUsernameeeeeeeeeee
				</Typography>
				<Typography variant="h6">jvermeer</Typography>
			</div>
		</div>
	);
}

function NavList({ handleTabClick }: { handleTabClick: (tab: BarStatus) => void }) {
	return (
		<ul className="flex flex-col gap-1 xl:mb-0 xl:mt-0 xl:flex-row xl:items-center xl:justify-center xl:gap-20">
			<Typography as="li" variant="body2" color="blue-gray" className="p-1 font-medium">
				<button onClick={() => handleTabClick('Friends')} className="flex items-center hover:text-blue-500 transition-colors">
					Friends
				</button>
			</Typography>
			<Typography as="li" variant="body2" color="blue-gray" className="p-1 font-medium">
				<button onClick={() => handleTabClick('Requests')} className="flex items-center hover:text-blue-500 transition-colors">
					Requests
				</button>
			</Typography>
			<Typography as="li" variant="body2" color="blue-gray" className="p-1 font-medium">
				<button onClick={() => handleTabClick('Blocked')} className="flex items-center hover:text-blue-500 transition-colors">
					Blocked
				</button>
			</Typography>
		</ul>
	);
}

function SocialNavBar({ handleTabClick }: { handleTabClick: (tab: BarStatus) => void }) {
	const [openNav, setOpenNav] = useState(false);

	function debounce(func: () => void, delay: number) {
		let timerId: NodeJS.Timeout | undefined;
		let b = false;
		return function () {
			clearTimeout(timerId);
			if (!b) {
				func();
				b = true;
			}
			timerId = setTimeout(() => {
				b = false;
			}, delay);
		};
	}

	useEffect(() => {
		const handleWindowResize = () => {
			console.log('handle window call');
			if (openNav) {
				console.log('react rerender from handle window');
				setOpenNav(false);
			}
		};
		const debouncedHandleWindowResize = debounce(handleWindowResize, 200);
		window.addEventListener('resize', debouncedHandleWindowResize);
		return () => {
			window.removeEventListener('resize', debouncedHandleWindowResize);
		};
	}, [openNav]);

	return (
		<Navbar className="mx-auto max-w-md py-2 mb-2">
			<div className="flex items-center justify-center text-blue-gray-900">
				<div className="hidden xl:block">
					<NavList handleTabClick={handleTabClick} />
				</div>
				<IconButton
					variant="text"
					className="xl:hidden ml-auto h-6 w-6 text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent"
					ripple={false}
					onClick={() => setOpenNav(!openNav)}
				>
					{openNav ? <XMarkIcon className="h-6 w-6" strokeWidth={2} /> : <Bars3Icon className="h-6 w-6" strokeWidth={2} />}
				</IconButton>
			</div>
			<Collapse open={openNav}>
				<div className={`transition-all duration-20 ${openNav ? 'opacity-100' : 'opacity-0'}`}>
					<NavList handleTabClick={handleTabClick} />
				</div>
			</Collapse>
		</Navbar>
	);
}

function UserBlock({ avatar, username, login42, userOnline }: { avatar: string | undefined; username: string; login42: string; userOnline: string }) {
	return (
		<div className="relative mb-2 bg-white p-2 flex max-w-lg mx-auto items-center rounded-xl shadow-lg">
			<div className="relative">
				<Avatar src={avatar} alt="avatar" size="lg" withBorder={true} className="border-4 border-gray-700" />
				<div className="absolute -top-0.5 -right-0.5 h-6 w-6 bg-white rounded-full border-2 border-gray-700">
					<span
						className={`absolute h-4 w-4 ${
							userOnline === 'ONLINE' || userOnline === 'INGAME' ? 'bg-green-500' : 'bg-gray-500'
						} rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}
					></span>
				</div>
			</div>
			<div className="ml-4 ml-2 flex flex-col justify-center truncate">
				<Typography variant="h6" color="blue-gray">
					{username}
				</Typography>
				<Typography variant="h6">{login42}</Typography>
			</div>
		</div>
	);
}

function DoubleTab({ me, navTabName }: { me: i_me; navTabName: BarStatus }) {
	let firstTab;
	let secondTab;
	if (navTabName === 'Requests') {
		firstTab = 'Sent';
		secondTab = 'Received';
	} else if (navTabName === 'Blocked') {
		firstTab = 'Blocked';
		secondTab = 'Blocked Me';
	}
	return (
		<Tabs value="sent">
			<TabsHeader className="mx-auto max-w-xs">
				<Tab key="Sent" value="sent">
					{firstTab}
				</Tab>
				<Tab key="Received" value="received">
					{secondTab}
				</Tab>
			</TabsHeader>
			<TabsBody>
				<TabPanel key="Sent" value="sent">
					<DefaultUserBlock />
				</TabPanel>
				<TabPanel key="Received" value="received">
					<DefaultUserBlock />
				</TabPanel>
			</TabsBody>
		</Tabs>
	);
}

type BarStatus = 'Friends' | 'Requests' | 'Blocked';

export function SocialDialog() {
	const [open, setOpen] = useState(false);
	const [navTabName, setNavTabName] = useState<BarStatus>('Friends');
	const { me, mutate: mutateMe, isLoading: isLoadingMe, error: errorMe }: { isLoading: boolean; me: i_me; mutate: KeyedMutator<i_me>; error: Error } = useMe();

	const handleOpen = () => setOpen(!open);
	const handleTabClick = (value: BarStatus) => {
		if (value !== navTabName) setNavTabName(value);
	};

	// console.log(navTabName);

	if (isLoadingMe) {
		return (
			<div className="flex justify-center items-center p-3 bg-white">
				<Spinner />
			</div>
		);
	}
	if (errorMe) {
		// error
		return (
			<div
				className="flex justify-center items-center p-3 rounded-md text-red-500 hover:text-red-900 bg-white hover:!bg-red-50 hover:bg-opacity-80"
				onClick={() => {
					mutateMe();
				}}
			></div>
		);
	}

	const friends = me.friends;
	const blocked = me.blocked;
	const blockedBy = me.blockedBy;
	const friendRequestsSent = me.friendRequestsSent;
	const friendRequestsReceived = me.friendRequestsReceived;

	return (
		<Fragment>
			<Button onClick={handleOpen} variant="gradient" color="blue">
				Open Dialog me: {me.username}
			</Button>
			<div>
				<Dialog
					open={open}
					handler={handleOpen}
					size="md"
					animate={{
						mount: { scale: 1, y: 0 },
						unmount: { scale: 0.9, y: -100 }
					}}
					className="bg-gray-100"
				>
					<div className="hidden 2xl:block absolute top-2 right-2">
						<IconButton variant="text" onClick={handleOpen} className="h-6 w-6 text-inherit hover:bg-transparent focus:bg-transparent" ripple={false}>
							<XMarkIcon className="h-6 w-6" strokeWidth={2} />
						</IconButton>
					</div>
					<SocialNavBar handleTabClick={handleTabClick} />
					<DialogBody className="max-h-[30rem] min-h-[30rem] overflow-y-auto p-0">
						{navTabName === 'Friends' ? (
							<>
								<UserBlock avatar={me.avatar} username={me.username} login42={me.login42} userOnline="ONLINE" />
								<DefaultUserBlock />
								<DefaultUserBlock />
								<DefaultUserBlock />
								<DefaultUserBlock />
								<DefaultUserBlock />
							</>
						) : (
							<DoubleTab me={me} navTabName={navTabName} />
						)}
					</DialogBody>
					<DialogFooter className="bg-gray-300">
						<Button variant="gradient" color="gray" onClick={handleOpen} size="sm" className="2xl:invisible">
							Close
						</Button>
					</DialogFooter>
				</Dialog>
			</div>
		</Fragment>
	);
}

// export function SocialDialog() {
// 	const data = initialData;

// 	return data;
// }

// const initialData = [
// 	{ id: 1, username: 'Un-plutot-grand-pseudo', login42: 'dpaccagn', avatar: '../images/default-image.jpg', status: 'ONLINE', navBar: 'Friends'},
// 	{ id: 2, username: 'Un-plutot-grand-pseudo', login42: 'dpaccagn', avatar: '../images/default-image.jpg', status: 'ONLINE', navBar: 'Friends'},
// 	{ id: 3, username: 'Un-plutot-grand-pseudo', login42: 'dpaccagn', avatar: '../images/default-image.jpg', status: 'INGAME', navBar: 'Friends'},
// 	{ id: 4, username: 'Un-plutot-grand-pseudo', login42: 'dpaccagn', avatar: '../images/default-image.jpg', status: 'ONLINE', navBar: 'Friends'},
// 	{ id: 5, username: 'Un-plutot-grand-pseudo', login42: 'dpaccagn', avatar: '../images/default-image.jpg', status: 'OFFLINE', navBar: 'Friends'},
// 	{ id: 6, username: 'Un-plutot-grand-pseudo', login42: 'dpaccagn', avatar: '../images/default-image.jpg', status: 'ONLINE', navBar: 'Friends'},
// ]
