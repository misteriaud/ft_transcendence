import { Room } from './Chat.interface';
import { useMe } from '../../hooks/useUser';
import { useApi, useCustomSWR } from '../../hooks/useApi';
import {
	Menu,
	MenuHandler,
	MenuList,
	MenuItem,
	Spinner,
	Dialog,
	DialogHeader,
	DialogBody,
	DialogFooter,
	Button,
	Input,
	IconButton
} from '@material-tailwind/react';
import { User } from '../../components/user';
import { UserUI } from '../../components/userUI';
import { Bars3Icon, ChatBubbleOvalLeftEllipsisIcon, EllipsisVerticalIcon, KeyIcon, LockClosedIcon, NoSymbolIcon } from '@heroicons/react/24/outline';
import { useState, useRef, MutableRefObject, useEffect, useContext } from 'react';
import { useNotificationContext } from '../../hooks/useContext';
import { MembersDialog } from '../../components/room-members';
import { i_room } from '../../components/interfaces';
import { ObservableContext } from '../../context/storeProvider';
import { RocketLaunchIcon } from '@heroicons/react/24/solid';

export function PassDialog({ open, handleOpen, room, join }: any) {
	const [pass, setPass] = useState('');
	const inputRef: MutableRefObject<HTMLInputElement | null> = useRef(null);

	useEffect(() => {
		if (inputRef.current) inputRef.current.focus();
	}, [inputRef]);

	return (
		<Dialog open={open} size="sm" handler={handleOpen}>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					join(pass);
				}}
				className="flex flex-col gap-2"
			>
				<DialogHeader>{room.name} is protected by a password</DialogHeader>
				<DialogBody divider>
					<Input type="password" value={pass} onChange={(e) => setPass(e.target.value)} label="password" inputRef={inputRef}></Input>
				</DialogBody>
				<DialogFooter className="flex flex-row justify-center gap-2">
					<Button variant="text" color="red" onClick={() => handleOpen(null)}>
						<span>Cancel</span>
					</Button>
					<Button
						variant="gradient"
						color="green"
						onClick={() => {
							join(pass);
						}}
					>
						<span>Confirm</span>
					</Button>
				</DialogFooter>
			</form>
		</Dialog>
	);
}

export function RoomInfo({ room, onClick }: { room: i_room; onClick?: (e: any) => void }) {
	const { data: roomData, error: roomError, isLoading, mutate: roomMutate } = useCustomSWR(`/rooms/${room.id}`);
	const api = useApi();
	const { me, mutate } = useMe();
	const [openJoinPassDial, setOpenJoinPassDial] = useState(false);
	const [MembersDialogStatus, setMembersDialogStatus] = useState(false);
	const { notify } = useNotificationContext();
	const subject = useContext(ObservableContext);

	const handlePassDial = () => setOpenJoinPassDial(!openJoinPassDial);
	const handleMembersDialog = () => setMembersDialogStatus(!MembersDialogStatus);

	async function joinChat(password?: string) {
		if (room.access === 'PROTECTED' && !password) {
			setOpenJoinPassDial(true);
			return;
		}

		await api
			.post(`rooms/${room.id}/join`, { password })
			.then((result) => {
				mutate({
					...me,
					memberOf: [
						...me.memberOf,
						{
							room: {
								id: room.id,
								name: room.name,
								access: room.access
							}
						}
					]
				});
				roomMutate(roomData);
				notify({ elem: <h1>You successfully join {room.name}</h1>, color: 'green' });
			})
			.catch((error) => {
				notify({ elem: <h1>Wrong password</h1>, color: 'red' });
			});
	}

	async function leaveChat() {
		await api
			.delete(`rooms/${room.id}/leave`)
			.then((result) => {
				mutate({
					...me,
					memberOf: me.memberOf.filter(({ room: tmpRoom }: { room: i_room }) => tmpRoom.id !== room.id)
				});
				roomMutate(roomData);
			})
			.catch((error) => {
				console.log(error);
			});
	}

	if (isLoading) return <Spinner />;

	if (room.access === 'DIRECT_MESSAGE') {
		if (roomError) return <NoSymbolIcon />;
		const user = roomData.members.find((member: any) => member.user.id != me.id)?.user;
		return (
			<div className="flex justify-between w-full items-center">
				<User room_id={room.id} login42={user.login42} onClick={onClick} ignoreHoverStyle={true} className="basis-3/5" />
				<IconButton
					onClick={(e) => {
						e.stopPropagation();
						subject.next({ type: 'game', content: user.id });
					}}
					variant="text"
					color="blue-gray"
					className="opacity-20 hover:opacity-100 mx-2"
				>
					<RocketLaunchIcon className="h-5 w-5" />
				</IconButton>
			</div>
		);
	}

	let icon;
	switch (room.access) {
		case 'PUBLIC':
			icon = null;
			break;

		case 'PRIVATE':
			icon = <LockClosedIcon className="h-4 w-4 opacity-40" />;
			break;

		case 'PROTECTED':
			icon = <KeyIcon className="h-4 w-4 opacity-40" />;
			break;
	}

	const role: string | undefined = roomError ? undefined : roomData?.members.find((member: any) => member.user.id === me.id)?.role;

	let items = <></>;

	switch (role) {
		case undefined:
			items = (
				<MenuItem
					onClick={() => {
						joinChat();
					}}
				>
					Join
				</MenuItem>
			);
			break;

		case 'MEMBER':
			items = (
				<>
					<MenuItem onClick={leaveChat}>Leave Room</MenuItem>
					<hr className="my-1" />
					<MenuItem onClick={handleMembersDialog}>Members</MenuItem>
					<MembersDialog me={me} room_id={room.id} dialogStatus={MembersDialogStatus} dialogHandler={handleMembersDialog} />
				</>
			);
			break;
		default:
			items = (
				<>
					<MenuItem>Edit Room</MenuItem>
					<MenuItem onClick={leaveChat}>Leave Room</MenuItem>
					<hr className="my-1" />
					<MenuItem onClick={handleMembersDialog}>Members</MenuItem>
					<MembersDialog me={me} room_id={room.id} dialogStatus={MembersDialogStatus} dialogHandler={handleMembersDialog} />
				</>
			);
			break;
	}

	return (
		<div className="w-full flex justify-between items-center">
			<span
				onClick={(e) => {
					if (role && onClick) onClick(e);
				}}
				className={`basis-4/5 overflow-hidden flex items-center ${onClick ? 'cursor-pointer' : ''} gap-2`}
			>
				<h1 className="truncate">{room.name}</h1>
				{icon}
			</span>
			<Menu>
				<MenuHandler>
					<EllipsisVerticalIcon onClick={(e) => e.stopPropagation()} className="basis-1/5 w-5 h-5 opacity-50 hover:opacity-100" />
				</MenuHandler>
				<MenuList>{items}</MenuList>
			</Menu>
			<PassDialog open={openJoinPassDial} handleOpen={handlePassDial} join={joinChat} room={room} />
		</div>
	);
}
