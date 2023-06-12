import { forwardRef } from 'react';
import { MenuItem, Typography } from '@material-tailwind/react';
import { HandRaisedIcon, HandThumbUpIcon, UserMinusIcon, UserPlusIcon } from '@heroicons/react/24/solid';
import { KeyedMutator } from 'swr';
import { i_blocked, i_friend_requests, i_friends, i_me, i_user } from './interfaces';
import { useApi } from '../hooks/useApi';
import { useNotifyError, useNotifySuccess } from '../hooks/notifications';

export const MenuSocialItems = forwardRef((props: any, ref: any) => {
	const {
		me,
		mutateMe,
		user,
		mutateUser,
		menuHandler,
		onClick,
		...otherProps
	}: {
		me: i_me;
		mutateMe: KeyedMutator<i_me>;
		user: i_user;
		mutateUser: KeyedMutator<i_user>;
		menuHandler: () => void;
		onClick?: (event: React.MouseEvent<HTMLElement>) => void;
		otherProps?: any;
	} = props;
	const notifySuccess = useNotifySuccess();
	const notifyError = useNotifyError();
	const api = useApi();

	const meSentFriendRequestToUser = me.friendRequestsSent.some((f: i_friend_requests) => f.userB.id === user.id);
	const userSentFriendRequestToMe = me.friendRequestsReceived.some((f: i_friend_requests) => f.userB.id === me.id);
	const areMeAndUserFriends = me.friends.some((f: i_friends) => f.userB.id === user.id);
	const meBlockUser = me.blocked.some((f: i_blocked) => f.userB.id === user.id);
	const userBlockMe = me.blockedBy.some((f: i_blocked) => f.userB.id === me.id);

	const hideSendFriendRequest = areMeAndUserFriends || meSentFriendRequestToUser || userSentFriendRequestToMe || meBlockUser || userBlockMe;
	const hideCancelFriendRequest = areMeAndUserFriends || !meSentFriendRequestToUser || meBlockUser || userBlockMe;
	const hideAcceptFriendRequest = areMeAndUserFriends || !userSentFriendRequestToMe || meBlockUser || userBlockMe;
	const hideRejectFriendRequest = areMeAndUserFriends || !userSentFriendRequestToMe || meBlockUser || userBlockMe;
	const hideRemoveFriend = !areMeAndUserFriends;
	const hideBlock = meBlockUser;
	const hideUnblock = !meBlockUser;

	async function handleSendFriendRequest(onClick?: (event: React.MouseEvent<HTMLElement>) => void, e?: React.MouseEvent<HTMLElement>) {
		if (onClick && e) {
			onClick(e);
		}
		menuHandler();
		await api
			.post(`/users/${user.login42}/friend/request`)
			.then(() => {
				mutateMe();
				mutateUser();
				notifySuccess(`A friend request has been sent to ${user.username}.`);
			})
			.catch(() => {
				notifyError();
			});
	}

	async function handleCancelFriendRequest(onClick?: (event: React.MouseEvent<HTMLElement>) => void, e?: React.MouseEvent<HTMLElement>) {
		if (onClick && e) {
			onClick(e);
		}
		menuHandler();
		await api
			.delete(`/users/${user.login42}/friend/request`)
			.then(() => {
				mutateMe();
				mutateUser();
				notifySuccess(`Friend request sent to ${user.username} has been cancelled.`);
			})
			.catch(() => {
				notifyError();
			});
	}

	async function handleAcceptFriendRequest(onClick?: (event: React.MouseEvent<HTMLElement>) => void, e?: React.MouseEvent<HTMLElement>) {
		if (onClick && e) {
			onClick(e);
		}
		menuHandler();
		await api
			.post(`/users/${user.login42}/friend/response`)
			.then(() => {
				mutateMe();
				mutateUser();
				notifySuccess(`${user.username}'s friend request has been accepted.`);
			})
			.catch(() => {
				notifyError();
			});
	}

	async function handleRejectFriendRequest(onClick?: (event: React.MouseEvent<HTMLElement>) => void, e?: React.MouseEvent<HTMLElement>) {
		if (onClick && e) {
			onClick(e);
		}
		menuHandler();
		await api
			.delete(`/users/${user.login42}/friend/response`)
			.then(() => {
				mutateMe();
				mutateUser();
				notifySuccess(`${user.username}'s friend request has been rejected.`);
			})
			.catch(() => {
				notifyError();
			});
	}

	async function handleRemoveFriend(onClick?: (event: React.MouseEvent<HTMLElement>) => void, e?: React.MouseEvent<HTMLElement>) {
		if (onClick && e) {
			onClick(e);
		}
		menuHandler();
		await api
			.delete(`/users/${user.login42}/friend`)
			.then(() => {
				mutateMe();
				mutateUser();
				notifySuccess(`${user.username} has been removed from friends.`);
			})
			.catch(() => {
				notifyError();
			});
	}

	async function handleBlock(onClick?: (event: React.MouseEvent<HTMLElement>) => void, e?: React.MouseEvent<HTMLElement>) {
		if (onClick && e) {
			onClick(e);
		}
		menuHandler();
		await api
			.post(`/users/${user.login42}/block`)
			.then(() => {
				mutateMe();
				mutateUser();
				notifySuccess(`${user.username} has been blocked`);
			})
			.catch(() => {
				notifyError();
			});
	}

	async function handleUnblock(onClick?: (event: React.MouseEvent<HTMLElement>) => void, e?: React.MouseEvent<HTMLElement>) {
		if (onClick && e) {
			onClick(e);
		}
		menuHandler();
		await api
			.delete(`/users/${user.login42}/block`)
			.then(() => {
				mutateMe();
				mutateUser();
				notifySuccess(`${user.username} has been unblocked`);
			})
			.catch(() => {
				notifyError();
			});
	}

	return (
		<>
			<hr ref={ref} {...otherProps} className="my-2 border-blue-gray-50" />
			<MenuItem
				ref={ref}
				{...otherProps}
				className={`flex items-center gap-2 outline-none ${hideSendFriendRequest && 'hidden'}`}
				onClick={(e) => handleSendFriendRequest(onClick, e)}
				tabIndex={-1}
			>
				<UserPlusIcon strokeWidth={2} className="h-4 w-4" />
				<Typography variant="small" className="font-normal">
					Send Friend Request
				</Typography>
			</MenuItem>
			<MenuItem
				ref={ref}
				{...otherProps}
				className={`flex items-center gap-2 outline-none ${hideCancelFriendRequest && 'hidden'}`}
				onClick={(e) => handleCancelFriendRequest(onClick, e)}
				tabIndex={-1}
			>
				<UserMinusIcon strokeWidth={2} className="h-4 w-4" />
				<Typography variant="small" className="font-normal">
					Cancel Friend Request
				</Typography>
			</MenuItem>
			<MenuItem
				ref={ref}
				{...otherProps}
				className={`flex items-center gap-2 outline-none ${hideAcceptFriendRequest && 'hidden'}`}
				onClick={(e) => handleAcceptFriendRequest(onClick, e)}
				tabIndex={-1}
			>
				<UserPlusIcon strokeWidth={2} className="h-4 w-4" />
				<Typography variant="small" className="font-normal">
					Accept Friend Request
				</Typography>
			</MenuItem>
			<MenuItem
				ref={ref}
				{...otherProps}
				className={`flex items-center gap-2 outline-none ${hideRejectFriendRequest && 'hidden'}`}
				onClick={(e) => handleRejectFriendRequest(onClick, e)}
				tabIndex={-1}
			>
				<UserMinusIcon strokeWidth={2} className="h-4 w-4" />
				<Typography variant="small" className="font-normal">
					Reject Friend Request
				</Typography>
			</MenuItem>
			<MenuItem
				ref={ref}
				{...otherProps}
				className={`flex items-center gap-2 outline-none ${hideRemoveFriend && 'hidden'}`}
				onClick={(e) => handleRemoveFriend(onClick, e)}
				tabIndex={-1}
			>
				<UserMinusIcon strokeWidth={2} className="h-4 w-4" />
				<Typography variant="small" className="font-normal">
					Remove Friend
				</Typography>
			</MenuItem>
			<MenuItem
				ref={ref}
				{...otherProps}
				className={`flex items-center gap-2 outline-none ${hideBlock && 'hidden'}`}
				onClick={(e) => handleBlock(onClick, e)}
				tabIndex={-1}
			>
				<HandRaisedIcon strokeWidth={2} className="h-4 w-4" />
				<Typography variant="small" className="font-normal">
					Block User
				</Typography>
			</MenuItem>
			<MenuItem
				ref={ref}
				{...otherProps}
				className={`flex items-center gap-2 outline-none ${hideUnblock && 'hidden'}`}
				onClick={(e) => handleUnblock(onClick, e)}
				tabIndex={-1}
			>
				<HandThumbUpIcon strokeWidth={2} className="h-4 w-4" />
				<Typography variant="small" className="font-normal">
					Unblock User
				</Typography>
			</MenuItem>
		</>
	);
});
