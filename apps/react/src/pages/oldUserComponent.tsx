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

enum e_size {
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

function User({ me, user, size, showUsername, showLogin42, showMemberSince, reverse, clickable }: i_userProps) {
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

		const showProfile = !isCurrentPageProfilePage && !meBlockUser && !userBlockMe; // userCircle
		const showSendMessage = areMeAndUserFriends && !meBlockUser && !userBlockMe; // chatBubbleOvalLeftEllipsis / envelope
		const showInviteToRoom = areMeAndUserFriends && isMeAdminOrOwnerOfRoom && !meBlockUser && !userBlockMe; // home
		const showSendFriendRequest = !areMeAndUserFriends && !meSentFriendRequestToUser && !userSentFriendRequestToMe && !meBlockUser && !userBlockMe; // userPlus
		const showCancelFriendRequest = !areMeAndUserFriends && meSentFriendRequestToUser && !meBlockUser && !userBlockMe; // userMinus
		const showAcceptFriendRequest = !areMeAndUserFriends && userSentFriendRequestToMe && !meBlockUser && !userBlockMe; // userPlus
		const showRejectFriendRequest = !areMeAndUserFriends && userSentFriendRequestToMe && !meBlockUser && !userBlockMe; // userMinus
		const showRemoveFriend = areMeAndUserFriends; //userMinus
		const showBlock = !meBlockUser; // HandRaised
		const showUnblock = meBlockUser; // HandThumbUp

		// promote / demote -> sparkles
		// kick -> arrowLeftOnRectangleIcon
		// mute / unmute -> microphone / speakerWave

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
