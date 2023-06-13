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
import { User } from './user';
import { useNotifyError, useNotifySuccess } from '../hooks/notifications';
import { useApi } from '../hooks/useApi';

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
			if (openNav) {
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

function UserBlock({ login42, handleCheck, handleCross }: { login42: string; handleCheck: null | (() => void); handleCross: null | (() => void) }) {
	return (
		<div className="relative mb-2 bg-white p-2 flex max-w-lg mx-auto items-center rounded-xl shadow-lg w-full">
			<User login42={login42} className="grow" />
			<div className="flex ml-auto mr-2 gap-2">
				{handleCheck && (
					<IconButton variant="text" onClick={handleCheck} className="h-5 w-5 text-inherit hover:bg-transparent focus:bg-transparent" ripple={false}>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
							<path stroke-linecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
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

function BlockedTab({ me, handleUnblock }: { me: i_me; handleUnblock: any }) {
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
							const { login42, username } = users.userB;
							return <UserBlock key={login42} handleCheck={null} handleCross={() => handleUnblock(login42, username)} login42={login42} />;
						})}
					</ul>
				</TabPanel>
				<TabPanel key="Blocked by" value="Blocked by">
					<ul>
						{me.blockedBy.map((users) => {
							const { login42 } = users.userA;
							return <UserBlock key={login42} handleCheck={null} handleCross={null} login42={login42} />;
						})}
					</ul>
				</TabPanel>
			</TabsBody>
		</Tabs>
	);
}

function RequestsTab({ me, handleAccept, handleCancel, handleReject }: { me: i_me; handleAccept: any; handleReject: any; handleCancel: any }) {
	return (
		<Tabs value="Received">
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
							const { login42, username } = users.userB;
							return <UserBlock key={login42} handleCheck={null} handleCross={() => handleCancel(login42, username)} login42={login42} />;
						})}
					</ul>
				</TabPanel>
				<TabPanel key="Received" value="Received">
					<ul>
						{me.friendRequestsReceived.map((users) => {
							const { login42, username } = users.userA;
							return (
								<UserBlock
									key={login42}
									handleCheck={() => handleAccept(login42, username)}
									handleCross={() => handleReject(login42, username)}
									login42={login42}
								/>
							);
						})}
					</ul>
				</TabPanel>
			</TabsBody>
		</Tabs>
	);
}

function FriendsTab({ me, handleRemoveFriend }: { me: i_me; handleRemoveFriend: any }) {
	return (
		<ul>
			{me.friends.map((users) => {
				const { login42, username } = users.userB;
				return <UserBlock key={login42} handleCheck={null} handleCross={() => handleRemoveFriend(login42, username)} login42={login42} />;
			})}
		</ul>
	);
}

/* ////////////////////// Main component ////////////////////// */

type BarStatus = 'Friends' | 'Requests' | 'Blocked';

export function SocialDialog({ dialogStatus, dialogHandler }: any) {
	const [navTabName, setNavTabName] = useState<BarStatus>('Friends');
	const { me, mutate: mutateMe, isLoading: isLoadingMe, error: errorMe }: { isLoading: boolean; me: i_me; mutate: KeyedMutator<i_me>; error: Error } = useMe();
	const notifySuccess = useNotifySuccess();
	const notifyError = useNotifyError();
	const api = useApi();

	const handleTabClick = (value: BarStatus) => {
		if (value !== navTabName) setNavTabName(value);
	};

	async function handleCancelFriendRequest(login42: string, username: string) {
		await api
			.delete(`/users/${login42}/friend/request`)
			.then(() => {
				mutateMe();
				notifySuccess(`Friend request sent to ${username} has been cancelled.`);
			})
			.catch(() => {
				notifyError();
			});
	}

	async function handleAcceptFriendRequest(login42: string, username: string) {
		await api
			.post(`/users/${login42}/friend/response`)
			.then(() => {
				mutateMe();
				notifySuccess(`${username}'s friend request has been accepted.`);
			})
			.catch(() => {
				notifyError();
			});
	}

	async function handleRejectFriendRequest(login42: string, username: string) {
		await api
			.delete(`/users/${login42}/friend/response`)
			.then(() => {
				mutateMe();
				notifySuccess(`${username}'s friend request has been rejected.`);
			})
			.catch(() => {
				notifyError();
			});
	}

	async function handleRemoveFriend(login42: string, username: string) {
		await api
			.delete(`/users/${login42}/friend`)
			.then(() => {
				mutateMe();
				notifySuccess(`${username} has been removed from friends.`);
			})
			.catch(() => {
				notifyError();
			});
	}

	async function handleUnblock(login42: string, username: string) {
		await api
			.delete(`/users/${login42}/block`)
			.then(() => {
				mutateMe();
				notifySuccess(`${username} has been unblocked`);
			})
			.catch(() => {
				notifyError();
			});
	}

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
			<DialogBody className="max-h-[25rem] min-h-[25rem] overflow-y-auto p-0">
				<SocialDialogNavBar handleTabClick={handleTabClick} />
				{navTabName === 'Friends' && <FriendsTab me={me} handleRemoveFriend={handleRemoveFriend} />}
				{navTabName === 'Requests' && (
					<RequestsTab me={me} handleAccept={handleAcceptFriendRequest} handleCancel={handleCancelFriendRequest} handleReject={handleRejectFriendRequest} />
				)}
				{navTabName === 'Blocked' && <BlockedTab me={me} handleUnblock={handleUnblock} />}
			</DialogBody>
			<DialogFooter className="bg-gray-300 rounded-b-2xl">
				<Button variant="gradient" color="gray" onClick={dialogHandler} size="sm" className="2xl:invisible">
					Close
				</Button>
			</DialogFooter>
		</Dialog>
	);
}
