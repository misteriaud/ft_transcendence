import { KeyedMutator } from 'swr';
import { Button, Dialog, DialogHeader, DialogBody, DialogFooter, Spinner, Tabs, TabsHeader, Tab, TabsBody, TabPanel } from '@material-tailwind/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { useRoom } from '../hooks/useRoom';
import { e_member_role, i_member, i_room } from './interfaces';
import { useState } from 'react';
import { User } from './user';

export function MembersDialog({ me, room_id, dialogStatus, dialogHandler }: any) {
	const {
		room,
		mutate: mutateRoom,
		isLoading: isLoadingRoom,
		error: errorRoom
	}: { isLoading: boolean; room: i_room; mutate: KeyedMutator<i_room>; error: Error } = useRoom(room_id);
	const [activeTab, setActiveTab] = useState('members');

	if (isLoadingRoom) {
		return (
			<>
				<Dialog open={dialogStatus} handler={dialogHandler}>
					<DialogHeader className="justify-center">Members</DialogHeader>
					<DialogBody className="flex justify-around  items-center p-8" divider>
						<Spinner className="h-16 w-16" />
					</DialogBody>
				</Dialog>
			</>
		);
	}
	if (errorRoom) {
		return (
			<>
				<Dialog open={dialogStatus} handler={dialogHandler}>
					<DialogHeader className="justify-center">Members</DialogHeader>
					<DialogBody className="flex justify-around  items-center p-8" divider>
						<div
							className="flex justify-around w-full rounded-md text-red-500 outline-none hover:text-red-900 bg-white hover:!bg-red-50 hover:bg-opacity-80"
							onClick={() => mutateRoom()}
						>
							<ExclamationTriangleIcon strokeWidth={2} className="h-16 w-16 text-red-500" />
						</div>
					</DialogBody>
				</Dialog>
			</>
		);
	}

	const owner = [];
	const admins = [];
	const members = [];
	const banned = [];

	for (const member of room.members.filter((m: i_member) => m.role === e_member_role.OWNER && m.banned === false)) {
		owner.push(<User room_id={room.id} login42={member.user.login42} ignoreHoverStyle={me.id === member.user.id} />);
	}
	for (const member of room.members.filter((m: i_member) => m.role === e_member_role.ADMIN && m.banned === false)) {
		admins.push(<User room_id={room.id} login42={member.user.login42} ignoreHoverStyle={me.id === member.user.id} />);
	}
	for (const member of room.members.filter((m: i_member) => m.role === e_member_role.MEMBER && m.banned === false)) {
		members.push(<User room_id={room.id} login42={member.user.login42} ignoreHoverStyle={me.id === member.user.id} />);
	}
	for (const member of room.members.filter((m: i_member) => m.banned === true)) {
		banned.push(<User room_id={room.id} login42={member.user.login42} ignoreHoverStyle={me.id === member.user.id} />);
	}

	return (
		<Dialog open={dialogStatus} handler={dialogHandler}>
			<DialogHeader className="justify-center">Members</DialogHeader>
			<DialogBody divider>
				<Tabs value={activeTab}>
					<TabsHeader
						className="rounded-none border-b border-blue-gray-50 bg-transparent p-0"
						indicatorProps={{
							className: 'bg-transparent border-b-2 border-blue-500 shadow-none rounded-none'
						}}
					>
						<Tab key="owner" value="owner" onClick={() => setActiveTab('owner')} className={activeTab === 'owner' ? 'text-blue-500' : ''}>
							Owner
						</Tab>
						<Tab key="admins" value="admins" onClick={() => setActiveTab('admins')} className={activeTab === 'admins' ? 'text-blue-500' : ''}>
							Admins
						</Tab>
						<Tab key="members" value="members" onClick={() => setActiveTab('members')} className={activeTab === 'members' ? 'text-blue-500' : ''}>
							Members
						</Tab>
						<Tab key="banned" value="banned" onClick={() => setActiveTab('banned')} className={activeTab === 'banned' ? 'text-blue-500' : ''}>
							Banned
						</Tab>
					</TabsHeader>
					<TabsBody>
						<TabPanel key={'owner'} value={'owner'} className="h-[50vh] overflow-scroll">
							{owner}
						</TabPanel>
						<TabPanel key={'admins'} value={'admins'} className="h-[50vh] overflow-scroll">
							{admins}
						</TabPanel>
						<TabPanel key={'members'} value={'members'} className="h-[50vh] overflow-scroll">
							{members}
						</TabPanel>
						<TabPanel key={'banned'} value={'banned'} className="h-[50vh] overflow-scroll">
							{banned}
						</TabPanel>
					</TabsBody>
				</Tabs>
			</DialogBody>
			<DialogFooter className="justify-center">
				<Button variant="text" color="red" onClick={dialogHandler}>
					<span>Close</span>
				</Button>
			</DialogFooter>
		</Dialog>
	);
}
