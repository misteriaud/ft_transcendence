import { useEffect, useState, useRef, createElement } from 'react';
import { useApi, useCustomSWR } from '../../hooks/useApi';
import { useSocketContext } from '../../hooks/useContext';
import { useMe } from '../../hooks/useUser';
import { Room, Message } from './Chat.interface';
import { RoomInfo } from './Room';
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
	Typography,
	List,
	ListItem,
	ListItemPrefix,
	Accordion,
	AccordionHeader,
	AccordionBody,
	IconButton,
	Radio,
	Chip,
	ListItemSuffix
} from '@material-tailwind/react';

import {
	ChevronRightIcon,
	ChevronDownIcon,
	UserIcon,
	UsersIcon,
	ChatBubbleBottomCenterTextIcon,
	PlusIcon,
	EyeIcon,
	Bars3Icon,
	XMarkIcon,
	LockClosedIcon
} from '@heroicons/react/24/outline';

function CreateRoom({ open, handleOpen }: { open: boolean; handleOpen: () => void }) {
	const [name, setName] = useState('');
	const [access, setAccess] = useState('PUBLIC');
	const [password, setPassword] = useState('');
	const { me, mutate } = useMe();
	const api = useApi();

	function submit(e: any) {
		e.preventDefault();
		if (!name) return;
		api
			.post('/rooms', {
				name,
				access,
				password
			})
			.then((response) => {
				mutate({
					...me,
					memberOf: [...me.memberOf, { room: response.data }]
				});
				setName('');
				setPassword('');
				handleOpen();
			})
			.catch((error) => {
				console.log(error);
			});
	}

	return (
		<Dialog open={open} handler={handleOpen} size="xs">
			<form onSubmit={submit} className="flex flex-col gap-2">
				<DialogHeader>Create new room</DialogHeader>
				<DialogBody divider className="flex flex-col gap-2 items-center">
					<div className="flex">
						<Radio id="PUBLIC" value="PUBLIC" name="type" label="Public" onChange={(e) => setAccess(e.target.value)} checked={access === 'PUBLIC'} />
						<Radio id="PRIVATE" value="PRIVATE" name="type" label="Private" onChange={(e) => setAccess(e.target.value)} checked={access === 'PRIVATE'} />
						<Radio
							id="PROTECTED"
							value="PROTECTED"
							name="type"
							label="Protected"
							onChange={(e) => setAccess(e.target.value)}
							checked={access === 'PROTECTED'}
						/>
					</div>
					<Input value={name} onChange={(e) => setName(e.target.value)} label="name"></Input>
					{access == 'PROTECTED' && <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} label="password"></Input>}
				</DialogBody>
				<DialogFooter className="flex flex-row">
					<Button variant="text" color="red" onClick={handleOpen} className="mr-1">
						<span>Cancel</span>
					</Button>
					<Button variant="gradient" color="green" onClick={submit}>
						<span>Create</span>
					</Button>
				</DialogFooter>
			</form>
		</Dialog>
	);
}

function Chat({ roomInfo, close }: { roomInfo: Room; close: () => void }) {
	const [isFold, setIsFold] = useState(false);
	const [chatInput, setChatInput] = useState('');
	const { me } = useMe();
	const { isLoading, data: messages, error, mutate } = useCustomSWR(`/rooms/${roomInfo.id}/message`);
	const { isConnected, socket } = useSocketContext();
	const lastMessageRef = useRef<HTMLLIElement>(null);

	useEffect(() => {
		if (!isConnected) return;
		socket.on(`chat/newMessage/${roomInfo.id}`, (newMessage) => {
			mutate([...messages, newMessage]);
		});
		return () => {
			socket.off(`chat/newMessage/${roomInfo.id}`);
		};
	}, [isConnected, mutate, messages]);
	useEffect(() => {
		if (lastMessageRef.current) lastMessageRef.current.scrollIntoView();
	}, [messages]);

	function sendMessage(e: any) {
		e.preventDefault();
		if (!chatInput || !isConnected) return;
		socket.emit('chat/postMessage', {
			roomId: roomInfo.id,
			content: chatInput
		});
		setChatInput('');
	}

	if (isLoading) return <Spinner />;
	if (error) return <h1>Something went wrong</h1>;

	return (
		<li className="self-end flex flex-col justify-content w-56 max-h-80 mr-2 border-2 border-black/20 shadow-lg overflow-hidden rounded-t-lg backdrop-blur-sm  transition-all duration-500">
			<div className="flex justify-around items-center px-2 py-1 bg-black bg-opacity-5 cursor-pointer hover:bg-opacity-10" onClick={() => setIsFold(!isFold)}>
				<RoomInfo room={roomInfo} />
				{close && (
					<IconButton onClick={close} variant="text" color="blue-gray">
						<XMarkIcon className="h-5 w-5" />
					</IconButton>
				)}
			</div>
			{!isFold && (
				<div className="flex-shrink min-h-0 overflow-scroll flex flex-col">
					<ul className="overflow-scroll pt-2 flex flex-col pr-2">
						{messages.map((message: Message) => (
							<li key={message.id} className={`self-${message.author.user.id == me.id ? 'end' : 'start'} m-1 flex flex-col items-end`}>
								<p className="shrink select-none text-gray-700 text-xs opacity-70 flex gap-1">
									{new Date(message.createdAt).getHours()}:{new Date(message.createdAt).getMinutes()}
								</p>
								<p className="flex-shrink min-w-0 rounded-md bg-white bg-opacity-90 px-1 py-0.5">{message.content}</p>
							</li>
						))}
						<li ref={lastMessageRef}></li>
					</ul>
					<form onSubmit={sendMessage} className="flex static bottom-0 left-0 right-0">
						<input
							value={chatInput}
							onChange={(e) => setChatInput(e.target.value)}
							placeholder="message"
							className="w-full py-1 px-2 m-2 rounded outline-none opacity-60 focus:opacity-90"
						></input>
					</form>
				</div>
			)}
		</li>
	);
}

function ChatSettings() {
	const [open, setOpen] = useState(false);

	const handleOpen = () => setOpen(!open);
	return (
		<>
			<div className="w-full flex justify-between">
				<h1>Chat</h1>
				<Menu>
					<MenuHandler>
						<Bars3Icon onClick={(e) => e.preventDefault()} />
					</MenuHandler>
					<MenuList>
						<MenuItem onClick={handleOpen}>Create room</MenuItem>
						<MenuItem onClick={handleOpen}>Join room</MenuItem>
					</MenuList>
				</Menu>
			</div>
			<CreateRoom open={open} handleOpen={handleOpen} />
		</>
	);
}

function ChatAccordeon({
	name,
	rooms,
	openedRooms,
	Icon,
	openChat,
	plusAction
}: {
	name: string;
	rooms: Room[];
	openedRooms: number[];
	Icon: any;
	openChat: (id: number) => void;
	plusAction?: (e: any) => void;
}) {
	const [open, setOpen] = useState(false);

	return (
		<Accordion open={open} icon={<ChevronDownIcon strokeWidth={2.5} className={`mx-auto h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />}>
			<ListItem className="p-0" selected={open} ripple={false}>
				<AccordionHeader onClick={() => setOpen(!open)} className="border-b-0 p-3">
					<ListItemPrefix>{createElement(Icon, { className: 'h-5 w-5' })}</ListItemPrefix>
					<div className="flex mr-auto font-normal gap-2 text-base">
						{name}
						<Chip value={rooms.length} variant="ghost" size="sm" className="rounded-full" />
					</div>
					{plusAction && (
						<ListItemSuffix className="opacity-70 hover:opacity-100">
							<PlusIcon className="h-5 w-5" onClick={plusAction} />
						</ListItemSuffix>
					)}
				</AccordionHeader>
			</ListItem>
			<AccordionBody className="py-1 overflow-scroll">
				<List className="p-0">
					{rooms.map((room: Room) => {
						return (
							<ListItem key={room.id} ripple={false} selected={openedRooms.some((id) => id === room.id)}>
								<RoomInfo room={room} onClick={() => openChat(room.id)} />
							</ListItem>
						);
					})}
				</List>
			</AccordionBody>
		</Accordion>
	);
}

export function ChatPanel() {
	const { me } = useMe();
	const { data: dataRoomsAvailable, isLoading } = useCustomSWR('/rooms');
	const [openedChatIds, setOpenedChat] = useState<number[]>([]);
	const [openCreateRoom, setOpenCreateRoom] = useState(false);

	if (isLoading) return null;

	function openChat(roomIdToOpen: number) {
		if (openedChatIds.findIndex((roomId: number) => roomId === roomIdToOpen) != -1) return;
		setOpenedChat([...openedChatIds, roomIdToOpen]);
	}

	function closeChat(roomIdToClose: number) {
		setOpenedChat(openedChatIds.filter((roomId: number) => roomId != roomIdToClose));
	}

	const handleCreateRoom = () => {
		setOpenCreateRoom(!openCreateRoom);
	};

	const rooms: Record<string, Room[]> = me.memberOf.reduce(
		(acc: Record<string, Room[]>, { room }: { room: Room }) => {
			switch (room.access) {
				case 'DIRECT_MESSAGE':
					return {
						...acc,
						friends: [...acc.friends, room]
					};
					break;

				default:
					return {
						...acc,
						rooms: [...acc.rooms, room]
					};
					break;
			}
		},
		{
			friends: [],
			rooms: []
		}
	);
	const filterAvailable: Room[] = dataRoomsAvailable.filter(
		(availableRoom: Room) => !me.memberOf.some(({ room: memberRoom }: { room: Room }) => memberRoom.id === availableRoom.id)
	);

	const openedChat = me.memberOf.reduce((acc: Room[], { room }: { room: Room }) => {
		if (!openedChatIds.some((roomId) => room.id === roomId)) return acc;
		return [...acc, room];
	}, []);

	return (
		<>
			<ul className="absolute bottom-0 right-72 flex flex-row">
				{openedChat.map((room: Room) => {
					return <Chat roomInfo={room} close={() => closeChat(room.id)} key={room.id} />;
				})}
			</ul>
			<div className="bg-white w-72 p-2 flex flex-col">
				<List className="overflow-scroll">
					<ChatAccordeon key="friends" name="Friends" rooms={rooms.friends} openedRooms={openedChatIds} Icon={UsersIcon} openChat={openChat} />
					<ChatAccordeon
						key="rooms"
						name="Rooms"
						rooms={rooms.rooms}
						openedRooms={openedChatIds}
						Icon={ChatBubbleBottomCenterTextIcon}
						openChat={openChat}
						plusAction={(e) => {
							e.stopPropagation();
							setOpenCreateRoom(true);
						}}
					/>
				</List>
				<List className="mt-auto">
					<ChatAccordeon name="Available Rooms" rooms={filterAvailable} openedRooms={[]} Icon={EyeIcon} openChat={openChat} />
				</List>
			</div>
			<CreateRoom open={openCreateRoom} handleOpen={handleCreateRoom} />
		</>
	);
}
