import { useState, useEffect } from 'react';
import {
	Button,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
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
import { i_me } from './interfaces';
import { useMe } from '../hooks/useUser';
import { KeyedMutator } from 'swr';

/* ////////////////////// Component navigation bar  ////////////////////// */

function NavList({ handleTabClick }: { handleTabClick: (tab: BarStatus) => void }) {
	return (
		<ul className="flex flex-col gap-1 xl:mb-0 xl:mt-0 xl:flex-row xl:items-center xl:justify-center xl:gap-20">
			<Typography as="li" variant="paragraph" color="blue-gray" className="p-1 font-medium">
				<button onClick={() => handleTabClick('Friends')} className="flex items-center hover:text-blue-500 transition-colors">
					Friends
				</button>
			</Typography>
			<Typography as="li" variant="paragraph" color="blue-gray" className="p-1 font-medium">
				<button onClick={() => handleTabClick('Requests')} className="flex items-center hover:text-blue-500 transition-colors">
					Requests
				</button>
			</Typography>
			<Typography as="li" variant="paragraph" color="blue-gray" className="p-1 font-medium">
				<button onClick={() => handleTabClick('Blocked')} className="flex items-center hover:text-blue-500 transition-colors">
					Blocked
				</button>
			</Typography>
		</ul>
	);
}

function SocialDialogNavBar({ handleTabClick }: { handleTabClick: (tab: BarStatus) => void }) {
	const [openNav, setOpenNav] = useState(false);

	// Debounce function to avoid re-rendering every time you resize the page.
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

	// Closes the navigation bar if the user resizes the page.
	// Use of debounce function to prevent re-rendering.
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

/* ////////////////////// Display each user line ////////////////////// */

function UserBlock({
	avatar,
	username,
	login42,
	userStatus,
	handleCheck,
	handleCross
}: {
	avatar: string | undefined;
	username: string;
	login42: string;
	userStatus: string;
	handleCheck: null | (() => void);
	handleCross: null | (() => void);
}) {
	return (
		<div className="relative mb-2 bg-white p-2 flex max-w-lg mx-auto items-center rounded-xl shadow-lg">
			<div className="relative">
				<Avatar src={avatar} alt="avatar" size="lg" withBorder={true} className="border-4 border-gray-700" />
				<div className="absolute -top-0.5 -right-0.5 h-6 w-6 bg-white rounded-full border-2 border-gray-700">
					<span
						className={`absolute h-4 w-4 ${
							userStatus === 'ONLINE' || userStatus === 'INGAME' ? 'bg-green-500' : 'bg-gray-500'
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
			<div className="flex ml-auto mr-2 gap-2">
				{handleCheck && (
					<IconButton variant="text" onClick={handleCheck} className="h-5 w-5 text-inherit hover:bg-transparent focus:bg-transparent" ripple={false}>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-5 h-5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
						</svg>
					</IconButton>
				)}
				{handleCross && (
					<IconButton variant="text" onClick={handleCross} className="h-5 w-5 text-inherit hover:bg-transparent focus:bg-transparent" ripple={false}>
						<XMarkIcon className="h-5 w-5" strokeWidth={2} />
					</IconButton>
				)}
			</div>
		</div>
	);
}

/* ////////////////////// CSS Tabs components ////////////////////// */

function BlockedTab({ me }: { me: i_me }) {
	return (
		<Tabs value="Blocked">
			<TabsHeader className="mx-auto max-w-xs">
				<Tab key="Blocked" value="Blocked">
					Blocked
				</Tab>
				<Tab key="Blocked by" value="Blocked by">
					Blocked by
				</Tab>
			</TabsHeader>
			<TabsBody>
				<TabPanel key="Blocked" value="Blocked">
					<ul>
						{me.blocked.map((users) => {
							const { username, login42, avatar } = users.userB;
							return (
								<UserBlock
									key={username}
									handleCheck={null}
									handleCross={() => console.log('deleted')}
									avatar={avatar}
									username={username}
									login42={login42}
									userStatus={status}
								/>
							);
						})}
					</ul>
				</TabPanel>
				<TabPanel key="Blocked by" value="Blocked by">
					<ul>
						{me.blockedBy.map((users) => {
							const { username, login42, avatar } = users.userA;
							return (
								<UserBlock key={username} handleCheck={null} handleCross={null} avatar={avatar} username={username} login42={login42} userStatus={status} />
							);
						})}
					</ul>
				</TabPanel>
			</TabsBody>
		</Tabs>
	);
}

function RequestsTab({ me }: { me: i_me }) {
	return (
		<Tabs value="Sent">
			<TabsHeader className="mx-auto max-w-xs">
				<Tab key="Sent" value="Sent">
					Sent
				</Tab>
				<Tab key="Received" value="Received">
					Received
				</Tab>
			</TabsHeader>
			<TabsBody>
				<TabPanel key="Sent" value="Sent">
					<ul>
						{me.friendRequestsSent.map((users) => {
							const { username, login42, avatar } = users.userB;
							return (
								<UserBlock
									key={username}
									handleCheck={null}
									handleCross={() => console.log('deleted')}
									avatar={avatar}
									username={username}
									login42={login42}
									userStatus={status}
								/>
							);
						})}
					</ul>
				</TabPanel>
				<TabPanel key="Received" value="Received">
					<ul>
						{me.friendRequestsReceived.map((users) => {
							const { username, login42, avatar } = users.userA;
							return (
								<UserBlock
									key={username}
									handleCheck={() => console.log('checked')}
									handleCross={() => console.log('deleted')}
									avatar={avatar}
									username={username}
									login42={login42}
									userStatus={status}
								/>
							);
						})}
					</ul>
				</TabPanel>
			</TabsBody>
		</Tabs>
	);
}

function FriendsTab({ me }: { me: i_me }) {
	return (
		<ul>
			{me.friends.map((users) => {
				const { username, login42, avatar } = users.userB;
				return (
					<UserBlock
						key={username}
						handleCheck={null}
						handleCross={() => console.log('deleted')}
						avatar={avatar}
						username={username}
						login42={login42}
						userStatus={status}
					/>
				);
			})}
		</ul>
	);
}

/* ////////////////////// Main component ////////////////////// */

type BarStatus = 'Friends' | 'Requests' | 'Blocked';

export function SocialDialog({ dialogStatus, dialogHandler }: any) {
	const [open, setOpen] = useState(false);
	const [navTabName, setNavTabName] = useState<BarStatus>('Friends');
	const { me, mutate: mutateMe, isLoading: isLoadingMe, error: errorMe }: { isLoading: boolean; me: i_me; mutate: KeyedMutator<i_me>; error: Error } = useMe();

	const handleTabClick = (value: BarStatus) => {
		if (value !== navTabName) setNavTabName(value);
	};

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

	return (
		<Dialog
			open={dialogStatus}
			handler={dialogHandler}
			size="md"
			animate={{
				mount: { scale: 1, y: 0 },
				unmount: { scale: 0.9, y: -100 }
			}}
			className="bg-gray-100"
		>
			<DialogHeader className="justify-center">Social</DialogHeader>
			<div className="hidden 2xl:block absolute top-2 right-2">
				<IconButton variant="text" onClick={dialogHandler} className="h-6 w-6 text-inherit hover:bg-transparent focus:bg-transparent" ripple={false}>
					<XMarkIcon className="h-6 w-6" strokeWidth={2} />
				</IconButton>
			</div>
			<SocialDialogNavBar handleTabClick={handleTabClick} />
			<DialogBody className="max-h-[25rem] min-h-[25rem] overflow-y-auto p-0">
				{navTabName === 'Friends' && <FriendsTab me={me} />}
				{navTabName === 'Requests' && <RequestsTab me={me} />}
				{navTabName === 'Blocked' && <BlockedTab me={me} />}
			</DialogBody>
			<DialogFooter className="bg-gray-300">
				<Button variant="gradient" color="gray" onClick={dialogHandler} size="sm" className="2xl:invisible">
					Close
				</Button>
			</DialogFooter>
		</Dialog>
	);
}
