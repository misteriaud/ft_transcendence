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
	Bars3Icon
} from '@heroicons/react/24/outline';

function CreateRoom({ open, handleOpen }: { open: boolean; handleOpen: () => void }) {
	const [name, setName] = useState('');
	const [access, setAccess] = useState('PRIVATE');
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
		<Dialog open={open} handler={handleOpen} size="md">
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

function Box({ title, children, color, close }: any) {
	const [isFold, setIsFold] = useState(false);
	return (
		<li
			className={`self-end flex flex-col justify-content overflow-auto w-48 max-h-80 mr-2 border-2 border-black/20 shadow-lg shadow-[0_-20px_30px_-15px_rgba(0,0,0,0.3)] overflow-hidden rounded-t-lg bg-${color}-400`}
		>
			<div className={`flex justify-around items-center p-2 bg-black bg-opacity-20 cursor-pointer hover:bg-${color}-500`} onClick={() => setIsFold(!isFold)}>
				{title}
				{close && (
					<button onClick={close} className="m-2 w-6 h-6 flex justify-center items-center rounded-full bg-black bg-opacity-10 hover:bg-opacity-20">
						X
					</button>
				)}
			</div>
			<div className="flex-shrink min-h-0 overflow-scroll flex flex-col">{!isFold && children}</div>
		</li>
	);
}

function Chat({ roomInfo }: { roomInfo: Room }) {
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
		<>
			<ul className="overflow-scroll flex flex-col">
				{messages.map((message: Message) => (
					<li
						key={message.id}
						className={`flex-shrink min-w-0 self-${message.author.user.id == me.id ? 'end' : 'start'} rounded-md bg-white bg-opacity-90 px-1 py-0.5 m-1`}
					>
						{message.content}
					</li>
				))}
				<li ref={lastMessageRef}></li>
			</ul>
			<form onSubmit={sendMessage} className="flex static bottom-0 left-0 right-0">
				<input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="message" className="w-full p-1"></input>
			</form>
		</>
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
					<Typography color="blue-gray" className="flex mr-auto font-normal gap-2">
						{name}
						<Chip value={rooms.length} variant="ghost" size="sm" className="rounded-full" />
					</Typography>
					<ListItemSuffix>
						{plusAction && (
							<IconButton variant="text" color="blue-gray" onClick={plusAction}>
								<PlusIcon className="h-5 w-5" />
							</IconButton>
						)}
					</ListItemSuffix>
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
					return (
						<Box title={<RoomInfo room={room} />} color="green" close={() => closeChat(room.id)} key={room.id}>
							<Chat roomInfo={room} />
						</Box>
					);
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
