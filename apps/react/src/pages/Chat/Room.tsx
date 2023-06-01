import { Room } from './Chat.interface';
import { useMe } from '../../hooks/useUser';
import { useApi, useCustomSWR } from '../../hooks/useApi';
import { Menu, MenuHandler, MenuList, MenuItem, Spinner, Dialog, DialogHeader, DialogBody, DialogFooter, Button, Input } from '@material-tailwind/react';
import { User } from '../../components/User';
import { Bars3Icon, EllipsisVerticalIcon, KeyIcon, LockClosedIcon, NoSymbolIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

function RoomMembers({ room }: { room: Room }) {
	const { data, error, isLoading } = useCustomSWR(`/rooms/${room.id}`);

	if (!data || error || isLoading)
		return (
			<MenuItem>
				<Spinner />
			</MenuItem>
		);

	return (
		<Menu placement="left">
			<MenuHandler>
				<MenuItem>Members</MenuItem>
			</MenuHandler>
			<MenuList className="flex flex-col gap-2">
				{data.members.map((member: any) => (
					<MenuItem key={member.user.id} className="flex items-center gap-4 py-1">
						<User userId={member.user.id} />
					</MenuItem>
				))}
			</MenuList>
		</Menu>
	);
}

export function PassDialog({ open, handleOpen, room, join }: any) {
	const [pass, setPass] = useState('');

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
					<Input type="password" value={pass} onChange={(e) => setPass(e.target.value)} label="password"></Input>
				</DialogBody>
				<DialogFooter>
					<Button variant="text" color="red" onClick={() => handleOpen(null)} className="mr-1">
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

export function RoomInfo({ room, onClick }: { room: Room; onClick?: (e: any) => void }) {
	const { data: roomData, error: roomError, isLoading, mutate: roomMutate } = useCustomSWR(`/rooms/${room.id}`);
	const api = useApi();
	const { me, mutate } = useMe();
	const [openJoinPassDial, setOpenJoinPassDial] = useState(false);

	const handlePassDial = () => setOpenJoinPassDial(!openJoinPassDial);

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
			})
			.catch((error) => {
				console.log(error);
			});
	}

	async function leaveChat() {
		await api
			.delete(`rooms/${room.id}/leave`)
			.then((result) => {
				mutate({
					...me,
					memberOf: me.memberOf.filter(({ room: tmpRoom }: { room: Room }) => tmpRoom.id !== room.id)
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
		const user_id = roomData.members.find((member: any) => member.user.id != me.id)?.user.id;
		return (
			<div className="w-full flex justify-between" onClick={onClick}>
				<User userId={user_id} />
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
					<MenuItem>Members</MenuItem>
				</>
			);
			break;
		default:
			items = (
				<>
					<MenuItem>Edit Room</MenuItem>
					<MenuItem onClick={leaveChat}>Leave Room</MenuItem>
					<hr className="my-1" />
					<MenuItem>Members</MenuItem>
				</>
			);
			break;
	}

	return (
		<div className="w-full flex justify-between">
			<span
				onClick={(e) => {
					if (role && onClick) onClick(e);
				}}
				className={`basis-4/5 overflow-hidden flex items-center justify-start ${onClick ? 'cursor-pointer' : ''}`}
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
