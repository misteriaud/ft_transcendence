import { useState, useEffect } from 'react';
import { NavigateFunction, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
	Avatar,
	Badge,
	Button,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
	Input,
	Menu,
	MenuHandler,
	MenuItem,
	MenuList,
	Spinner,
	Switch,
	Typography
} from '@material-tailwind/react';
import { Cog6ToothIcon, EllipsisVerticalIcon, ExclamationTriangleIcon, PencilIcon, PowerIcon, UserCircleIcon, UsersIcon } from '@heroicons/react/24/solid';
import { useMe, useUser } from '../hooks/useUser';
import { useApi } from '../hooks/useApi';
import { KeyedMutator } from 'swr';
import QRCode from 'react-qr-code';
import { useStoreDispatchContext } from '../hooks/useContext';
import { StoreActionType } from '../context/storeProvider';

export enum e_size {
	SMALL = 'small',
	MEDIUM = 'medium',
	LARGE = 'large'
}

interface i_user {
	id: number;
	username: string;
	login42: string;
	avatar: string;
	history: any;
	createdAt: Date;
}

interface i_userProps {
	me: any;
	user: i_user;
	size: e_size;
	showUsername: boolean;
	showLogin42: boolean;
	showMemberSince: boolean;
	reverse: boolean;
	clickable: boolean;
}

function handleOpenContextMenu(
	e: any,
	showContextMenu: boolean,
	setMenuPositionX: React.Dispatch<React.SetStateAction<number>>,
	setMenuPositionY: React.Dispatch<React.SetStateAction<number>>,
	setShowContextMenu: React.Dispatch<React.SetStateAction<boolean>>
) {
	e.preventDefault();
	if (!e.target.closest('.contextMenu') && !showContextMenu) {
		setMenuPositionX(e.clientX);
		setMenuPositionY(e.clientY);
		setShowContextMenu(true);
	}
}

function handleCloseContextMenu(e: any, showContextMenu: boolean, setShowContextMenu: React.Dispatch<React.SetStateAction<boolean>>) {
	if (!e.target.closest('.contextMenu') && showContextMenu) {
		e.preventDefault();
		setShowContextMenu(false);
	}
}

function handleContextMenuProfile(navigate: NavigateFunction, login42: string, setShowContextMenu: React.Dispatch<React.SetStateAction<boolean>>) {
	setShowContextMenu(false);
	navigate(`/dashboard/users/${login42}`);
}

async function handleContextMenuSendFriendRequest(api: any, login42: string, setShowContextMenu: React.Dispatch<React.SetStateAction<boolean>>) {
	setShowContextMenu(false);
	await api.post(`/users/${login42}/friend/request`);
}

async function handleContextMenuCancelFriendRequest(api: any, login42: string, setShowContextMenu: React.Dispatch<React.SetStateAction<boolean>>) {
	setShowContextMenu(false);
	await api.delete(`/users/${login42}/friend/request`);
}

async function handleContextMenuAcceptFriendRequest(api: any, login42: string, setShowContextMenu: React.Dispatch<React.SetStateAction<boolean>>) {
	setShowContextMenu(false);
	await api.post(`/users/${login42}/friend/response`);
}

async function handleContextMenuRejectFriendRequest(api: any, login42: string, setShowContextMenu: React.Dispatch<React.SetStateAction<boolean>>) {
	setShowContextMenu(false);
	await api.delete(`/users/${login42}/friend/response`);
}

async function handleContextMenuRemoveFriend(api: any, login42: string, setShowContextMenu: React.Dispatch<React.SetStateAction<boolean>>) {
	setShowContextMenu(false);
	await api.delete(`/users/${login42}/friend`);
}

async function handleContextMenuBlock(api: any, login42: string, setShowContextMenu: React.Dispatch<React.SetStateAction<boolean>>) {
	setShowContextMenu(false);
	await api.post(`/users/${login42}/block`);
}

async function handleContextMenuUnblock(api: any, login42: string, setShowContextMenu: React.Dispatch<React.SetStateAction<boolean>>) {
	setShowContextMenu(false);
	await api.delete(`/users/${login42}/block`);
}

export function User({ me, user, size, showUsername, showLogin42, showMemberSince, reverse, clickable }: i_userProps) {
	const [menuPositionX, setMenuPositionX] = useState(0);
	const [menuPositionY, setMenuPositionY] = useState(0);
	const [showContextMenu, setShowContextMenu] = useState(false);
	const api = useApi();
	const location = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		function handleOutsideClick(e: any) {
			handleCloseContextMenu(e, showContextMenu, setShowContextMenu);
		}

		document.addEventListener('mousedown', handleOutsideClick);

		return () => {
			document.removeEventListener('mousedown', handleOutsideClick);
		};
	}, [showContextMenu]);

	let sideContentName = null;
	let sideContentDate = null;

	if (showUsername || showLogin42) {
		sideContentName = (
			<div>
				{showUsername && <p className="username">{user.username}</p>}
				{showLogin42 && <p className="login42">{user.login42}</p>}
			</div>
		);
	}
	if (showMemberSince) {
		sideContentDate = <div>{showMemberSince && <p className="memberSince">Member since {new Date(user.createdAt).toLocaleDateString()}</p>}</div>;
	}

	const sideContent = (
		<>
			{sideContentName}
			{sideContentDate}
		</>
	);

	const middleContent = (
		<div className="middle">
			<img className="avatar" src={user.avatar || '/favicon.ico'} alt="Avatar" />
			<span className="status online" />
		</div>
	);

	let leftContent = null;
	let rightContent = null;

	if (showUsername || showLogin42) {
		if (reverse) {
			leftContent = <div className={`side left ${showMemberSince ? 'space-between' : 'center'}`}>{sideContent}</div>;
		} else {
			rightContent = <div className={`side right ${showMemberSince ? 'space-between' : 'center'}`}>{sideContent}</div>;
		}
	}

	let contextMenu = null;

	if (clickable && me.id !== user.id) {
		const meAdminOrOwnerOfRooms = me.memberOf.filter((m: any) => m.role === 'OWNER' || m.role === 'ADMIN');

		const isCurrentPageProfilePage = user.login42 === location.pathname.split('/').pop();
		const areMeAndUserFriends = me.friends.some((f: any) => f.userB.id === user.id);
		const isMeAdminOrOwnerOfRoom = meAdminOrOwnerOfRooms.length > 0;
		const meSentFriendRequestToUser = me.friendRequestsSent.some((f: any) => f.userB.id === user.id);
		const userSentFriendRequestToMe = me.friendRequestsReceived.some((f: any) => f.userB.id === me.id);
		const meBlockUser = me.blocked.some((f: any) => f.userB.id === user.id);
		const userBlockMe = me.blockedBy.some((f: any) => f.userB.id === me.id);

		const showProfile = !isCurrentPageProfilePage && !meBlockUser && !userBlockMe;
		const showSendMessage = areMeAndUserFriends && !meBlockUser && !userBlockMe;
		const showInviteToRoom = areMeAndUserFriends && isMeAdminOrOwnerOfRoom && !meBlockUser && !userBlockMe;
		const showSendFriendRequest = !areMeAndUserFriends && !meSentFriendRequestToUser && !userSentFriendRequestToMe && !meBlockUser && !userBlockMe;
		const showCancelFriendRequest = !areMeAndUserFriends && meSentFriendRequestToUser && !meBlockUser && !userBlockMe;
		const showAcceptFriendRequest = !areMeAndUserFriends && userSentFriendRequestToMe && !meBlockUser && !userBlockMe;
		const showRejectFriendRequest = !areMeAndUserFriends && userSentFriendRequestToMe && !meBlockUser && !userBlockMe;
		const showRemoveFriend = areMeAndUserFriends;
		const showBlock = !meBlockUser;
		const showUnblock = meBlockUser;

		let profile = null;
		let sendMessage = null;
		let inviteToRoom = null;
		let sendFriendRequest = null;
		let cancelFriendRequest = null;
		let acceptFriendRequest = null;
		let rejectFriendRequest = null;
		let removeFriend = null;
		let block = null;
		let unblock = null;

		if (showProfile) {
			profile = (
				<li className="item" onClick={() => handleContextMenuProfile(navigate, user.login42, setShowContextMenu)}>
					Profile
				</li>
			);
		}
		if (showSendMessage) {
			sendMessage = <li className="item">Send a message</li>;
		}
		if (showInviteToRoom) {
			const roomsMenuItems = meAdminOrOwnerOfRooms.map((item: any) => (
				<li className="item" key={item.room.id}>
					{item.room.name}
				</li>
			));

			const yOffset = (showProfile ? 1 : 0) + (showSendMessage ? 1 : 0);
			inviteToRoom = (
				<li className="item">
					Invite to room
					<ul className="contextMenu roomsMenu" style={{ top: `${yOffset * 3}rem` }}>
						{roomsMenuItems}
					</ul>
				</li>
			);
		}
		if (showSendFriendRequest) {
			sendFriendRequest = (
				<li className="item" onClick={() => handleContextMenuSendFriendRequest(api, user.login42, setShowContextMenu)}>
					Send friend request
				</li>
			);
		}
		if (showCancelFriendRequest) {
			cancelFriendRequest = (
				<li className="item" onClick={() => handleContextMenuCancelFriendRequest(api, user.login42, setShowContextMenu)}>
					Cancel friend request
				</li>
			);
		}
		if (showAcceptFriendRequest) {
			acceptFriendRequest = (
				<li className="item" onClick={() => handleContextMenuAcceptFriendRequest(api, user.login42, setShowContextMenu)}>
					Accept friend request
				</li>
			);
		}
		if (showRejectFriendRequest) {
			rejectFriendRequest = (
				<li className="item" onClick={() => handleContextMenuRejectFriendRequest(api, user.login42, setShowContextMenu)}>
					Reject friend request
				</li>
			);
		}
		if (showRemoveFriend) {
			removeFriend = (
				<li className="item" onClick={() => handleContextMenuRemoveFriend(api, user.login42, setShowContextMenu)}>
					Remove friend
				</li>
			);
		}
		if (showBlock) {
			block = (
				<li className="item" onClick={() => handleContextMenuBlock(api, user.login42, setShowContextMenu)}>
					Block
				</li>
			);
		}
		if (showUnblock) {
			unblock = (
				<li className="item" onClick={() => handleContextMenuUnblock(api, user.login42, setShowContextMenu)}>
					Unblock
				</li>
			);
		}

		contextMenu = (
			/*
			[ OK ] Profile
			[TODO] Send message
			[TODO] Invite to room
			[ OK ] Send friend request
			[ OK ] Cancel friend request
			[ OK ] Accept friend request
			[ OK ] Reject friend request
			[ OK ] Block
			[ OK ] Unblock
			*/
			<ul className="contextMenu" style={{ left: menuPositionX, top: menuPositionY }}>
				{profile}
				{sendMessage}
				{inviteToRoom}
				{sendFriendRequest}
				{cancelFriendRequest}
				{acceptFriendRequest}
				{rejectFriendRequest}
				{removeFriend}
				{block}
				{unblock}
			</ul>
		);
	}

	return (
		<div
			className={`userCard ${size}`}
			onContextMenu={(e) => clickable && me.id !== user.id && handleOpenContextMenu(e, showContextMenu, setMenuPositionX, setMenuPositionY, setShowContextMenu)}
		>
			{leftContent}
			{middleContent}
			{rightContent}
			{showContextMenu && contextMenu}
		</div>
	);
}

// ----------------------------------------------------------------------------

interface User {
	id: number;
	username: string;
	login42: string;
	avatar?: string;
	twoFactorEnabled: boolean;
	twoFactorSecret?: string;
	status: e_user_status;
	friends: Friends[];
	friendOf: Friends[];
	friendRequestsSent: FriendRequests[];
	friendRequestsReceived: FriendRequests[];
	blocked: Blocked[];
	blockedBy: Blocked[];
	memberOf: Member[];
	history: Match[];
	createdAt: Date;
	updatedAt: Date;
}

// eslint-disable-next-line
interface Friends {}

// eslint-disable-next-line
interface FriendRequests {}

// eslint-disable-next-line
interface Blocked {}

// eslint-disable-next-line
interface Match {}

// eslint-disable-next-line
interface Room {}

// eslint-disable-next-line
interface Member {}

// eslint-disable-next-line
interface Message {}
// eslint-disable-next-line
interface Invitation {}

enum e_user_status {
	ONLINE,
	INQUEUE,
	INGAME,
	OFFLINE
}

// eslint-disable-next-line
enum e_match_map {
	CLASSIC
}

// eslint-disable-next-line
enum e_match_state {
	PREPARATION,
	INPROGRESS,
	FINISHED
}

// eslint-disable-next-line
enum e_room_access {
	PUBLIC,
	PROTECTED,
	PRIVATE,
	DIRECT_MESSAGE
}

// eslint-disable-next-line
enum e_member_role {
	OWNER,
	ADMIN,
	MEMBER
}

// ----------------------------------------------------------------------------

function SettingsDialog({ me, mutate, dialogStatus, dialogHandler }: any) {
	const [state, setState] = useState('initial');
	const [info, setInfo] = useState({
		username: me.username,
		avatar: null,
		avatarURL: me.avatar,
		twoFactorEnabled: me.twoFactorEnabled,
		twoFactorSecret: ''
	});
	const dispatch = useStoreDispatchContext();
	const api = useApi();

	function handleAvatarUpload(event: any) {
		const avatar = event.target.files[0];
		setState('editing');
		setInfo({ ...info, avatar: avatar, avatarURL: URL.createObjectURL(avatar) });
	}

	function handleUsernameChange(event: any) {
		setState('editing');
		setInfo({ ...info, username: event.target.value });
	}

	function handleTwoFactorEnabledChange(event: any) {
		setState('editing');
		setInfo({ ...info, twoFactorEnabled: event.target.checked });
	}

	function handleCancel() {
		setState('initial');
		setInfo({ ...info, username: me.username, avatarURL: me.avatar, twoFactorEnabled: me.twoFactorEnabled, twoFactorSecret: '' });
		dialogHandler();
	}

	async function handleSave() {
		const formData = new FormData();

		if (me.avatar !== info.avatarURL) {
			info.avatar && formData.append('avatar', info.avatar);
		}
		if (me.username !== info.username) {
			info.username && formData.append('username', info.username);
		}
		if (me.twoFactorEnabled !== info.twoFactorEnabled) {
			info.twoFactorEnabled && formData.append('twoFactorEnabled', info.twoFactorEnabled);
		}

		setState('loading');
		await api
			.put('/users/me', formData, {
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			})
			.then((res) => {
				mutate({
					...me,
					username: res.data.me.username,
					avatar: `${res.data.me.avatar}?t=${Date.now()}`,
					twoFactorEnabled: res.data.me.twoFactorEnabled
				});
				if (res.data.twoFactorSecret) {
					dispatch({
						type: StoreActionType.LOGIN,
						content: res.data.jwt
					});
					setState('two-factor-secret');
					setInfo({ ...info, twoFactorSecret: res.data.me.twoFactorSecret });
				} else {
					setState('initial');
					setInfo({ ...info, username: me.username, avatarURL: me.avatar, twoFactorEnabled: me.twoFactorEnabled, twoFactorSecret: '' });
					dialogHandler();
				}
			})
			.catch(() => {
				setState('editing');
			});
	}

	const editing = (
		<>
			<DialogBody className="flex justify-around p-8" divider>
				<div className="relative">
					<Avatar
						variant="circular"
						size="xxl"
						alt={me.login42}
						className="avatar cursor-pointer transition-brightness duration-300 hover:brightness-75"
						src={info.avatarURL}
						onClick={() => document.getElementById('avatar-upload')?.click()}
					/>
					<PencilIcon
						strokeWidth={2}
						className="pencil-icon h-8 w-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
					/>
					<input id="avatar-upload" className="hidden" type="file" accept="image/*" onChange={handleAvatarUpload} />
				</div>
				<div className="flex flex-col justify-around">
					<Input variant="static" label="Username" value={info.username} onChange={handleUsernameChange} />
					<Switch
						id="two-factor-authentication"
						label="Enable two-factor authentication"
						checked={info.twoFactorEnabled}
						onChange={handleTwoFactorEnabledChange}
					/>
				</div>
			</DialogBody>
			<DialogFooter className="justify-center">
				<Button variant="text" color="red" onClick={handleCancel} className="mr-1">
					<span>Cancel</span>
				</Button>
				<Button variant="gradient" color="green" onClick={handleSave}>
					<span>Save</span>
				</Button>
			</DialogFooter>
		</>
	);

	const loading = (
		<DialogBody className="flex justify-around p-8" divider>
			<Spinner className="h-24 w-24" />
		</DialogBody>
	);

	const twoFactorSecret = (
		<>
			<DialogBody className="flex flex-col justify-around items-center p-8" divider>
				<Typography className="text-center" variant="h1" color="blue">
					{info.twoFactorSecret}
				</Typography>
				<QRCode className="mt-4 mb-4" value={`otpauth://totp/ft_transcendence?secret=${info.twoFactorSecret}&algorithm=SHA1&digits=6&period=30`} />
				<div className="flex items-center">
					<ExclamationTriangleIcon strokeWidth={2} className="h-16 w-16 text-red-500" />
					<Typography className="text-center" variant="h6" color="red">
						This code is essential for your account's security. Once this popup is closed, it will no longer be visible, and you won't be able to access your
						account without it.
					</Typography>
				</div>
			</DialogBody>
			<DialogFooter className="justify-center">
				<Button variant="text" color="red" onClick={handleCancel} className="mr-1">
					<span>Close</span>
				</Button>
			</DialogFooter>
		</>
	);

	return (
		<Dialog
			className="settings-dialog"
			open={dialogStatus}
			handler={handleCancel}
			dismiss={{ enabled: state !== 'loading' && state !== 'two-factor-secret' }}
			animate={{
				mount: { scale: 1, y: 0 },
				unmount: { scale: 0.9, y: -100 }
			}}
		>
			<DialogHeader className="justify-center">Settings</DialogHeader>
			{(state === 'initial' || state === 'editing') && editing}
			{state === 'loading' && loading}
			{state === 'two-factor-secret' && twoFactorSecret}
		</Dialog>
	);
}

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

	if (isLoading) {
		return <Spinner />;
	}
	return (
		<Menu open={openMenu} handler={handleOpenCloseMenu}>
			<MenuHandler>
				<div className="flex justify-center items-center p-3 rounded-md text-blue-gray-500 hover:text-blue-gray-900 bg-white hover:bg-blue-gray-50 hover:bg-opacity-80">
					<Typography variant="h5" className="font-normal px-3 py-2">
						{me.username}
					</Typography>
					<Badge overlap="circular" placement="bottom-end" color="green">
						<Avatar variant="circular" alt={me.username} className="cursor-pointer" src={`${me.avatar}?t=${Date.now()}`} />
					</Badge>
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
				<MenuItem className="flex items-center gap-2" onClick={signOut}>
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

export function UserActionsButton() {
	return (
		<Button variant="text">
			<EllipsisVerticalIcon className="h-6 w-6 text-gray-500" />
		</Button>
	);
}

export function ProfilePage() {
	const { username } = useParams();
	const { isLoading: isLoadingMe /*, me*/ } = useMe();
	const { isLoading: isLoadingUser, user } = useUser(username || '');

	if (isLoadingMe || isLoadingUser) {
		return <Spinner />;
	}
	if (!user) {
		return <h2>User not Found</h2>;
	}
	return (
		/*
		<>
			<User me={me} user={user} size={e_size.SMALL} showUsername={true} showLogin42={false} showMemberSince={false} reverse={true} clickable={true} />
			<User me={me} user={user} size={e_size.MEDIUM} showUsername={true} showLogin42={true} showMemberSince={false} reverse={false} clickable={true} />
			<User me={me} user={user} size={e_size.LARGE} showUsername={true} showLogin42={true} showMemberSince={true} reverse={false} clickable={true} />
		</>
		*/
		/*
		<>
			<User user={user} size={e_size.LARGE} showUsername={true} showLogin42={true} reverse={false} />
		</>
		*/
		<>
			<UserActionsButton></UserActionsButton>
			<Me></Me>
			<Button>Button</Button>;
		</>
	);
}
