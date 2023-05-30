import { Room } from './Chat.interface';
import { useMe } from '../../hooks/useUser';
import { useApi, useCustomSWR } from '../../hooks/useApi';
import { Menu, MenuHandler, MenuList, MenuItem, Spinner } from '@material-tailwind/react';
import { User } from '../../components/User';
import { Bars3Icon, EllipsisVerticalIcon, KeyIcon, LockClosedIcon } from '@heroicons/react/24/outline';

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

export function RoomInfo({ room, onClick }: { room: Room; onClick?: (e: any) => void }) {
	const api = useApi();
	const { me, mutate } = useMe();

	// async function joinChat() {
	// 	await api
	// 		.post(`rooms/${room.id}/join`)
	// 		.then((result) => {
	// 			mutate({
	// 				...me,
	// 				memberOf: [
	// 					...me.memberOf,
	// 					{
	// 						room: {
	// 							id: room.id,
	// 							name: room.name,
	// 							access: room.access
	// 						}
	// 					}
	// 				]
	// 			});
	// 		})
	// 		.catch((error) => {
	// 			console.log(error);
	// 			// setTotp("");
	// 			// setIsError(true);
	// 		});
	// }

	if (room.access === 'DIRECT_MESSAGE' && room.userId)
		return (
			<div className="w-full flex justify-between" onClick={onClick}>
				<User userId={room.userId} />
			</div>
		);

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
	return (
		<div className="w-full flex justify-between">
			<span onClick={onClick} className={`basis-4/5 overflow-hidden flex items-center justify-start ${onClick ? 'cursor-pointer' : ''}`}>
				<h1 className="truncate">{room.name}</h1>
				{icon}
			</span>
			<Menu>
				<MenuHandler>
					<EllipsisVerticalIcon onClick={(e) => e.preventDefault()} className="basis-1/5 w-5 h-5 opacity-50 hover:opacity-100" />
				</MenuHandler>
				<MenuList>
					<MenuItem>Edit Room</MenuItem>
					<MenuItem>Create an invitation</MenuItem>
					<hr className="my-1" />
					<RoomMembers room={room} />
				</MenuList>
			</Menu>
		</div>
	);
}
