import { Room } from './Chat.interface';
import { useMe } from '../../hooks/useUser';
import { useApi, useCustomSWR } from '../../hooks/useApi';
import { Menu, MenuHandler, MenuList, MenuItem, Button, Spinner } from '@material-tailwind/react';
import { User } from '../../components/User';

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

	async function joinChat() {
		await api
			.post(`rooms/${room.id}/join`)
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
			})
			.catch((error) => {
				console.log(error);
				// setTotp("");
				// setIsError(true);
			});
	}

	// const isMember = me.memberOf.some((member: { room: Room }) => room.id === member.room.id);

	return (
		<div className="w-full flex justify-between">
			<h1 onClick={onClick} className={onClick ? 'cursor-pointer' : ''}>
				{room.name}
			</h1>
			<Menu>
				<MenuHandler>
					<button onClick={(e) => e.preventDefault()}>...</button>
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
