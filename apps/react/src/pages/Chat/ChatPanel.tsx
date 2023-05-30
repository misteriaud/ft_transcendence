import { useEffect, useState, useRef } from 'react';
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
	Chip
} from '@material-tailwind/react';

import { ChevronRightIcon, ChevronDownIcon, UserIcon, UsersIcon, ChatBubbleBottomCenterTextIcon, PlusIcon } from '@heroicons/react/24/outline';
import escapeRegExp from 'escape-string-regexp';

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
				console.log(me);
				mutate({
					...me,
					memberOf: [...me.memberOf, { room: response.data }]
				});
				console.log(response);
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
				<DialogBody divider>
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
					{access == 'PROTECTED' ? <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="name"></input> : null}
				</DialogBody>
				<DialogFooter className="flex flex-row">
					<Button variant="text" color="red" onClick={handleOpen} className="mr-1">
						<span>Cancel</span>
					</Button>
					<Button variant="gradient" color="green" onClick={submit}>
						<span>Confirm</span>
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
						<button onClick={(e) => e.preventDefault()}>...</button>
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

export function ChatPanel() {
	const { me } = useMe();
	const [openedChatIds, setOpenedChat] = useState<number[]>([]);
	const [openFriends, setOpenFriends] = useState(true);
	const [openRooms, setOpenRooms] = useState(true);
	const [openCreateRoom, setOpenCreateRoom] = useState(false);
	const [searchInput, setSearchInput] = useState('');

	// if (isLoading) return null;
	// // return (<Spinner />)

	// if (error) return <h1>Error</h1>;

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

	const rooms: Room[] = me.memberOf.map((member: any) => member.room);
	const filteredRooms: Room[] = rooms.filter((room: Room) => {
		const regex = new RegExp(escapeRegExp(searchInput), 'i');
		return regex.test(room.name);
	});
	const openedChat = rooms.filter((room: Room) => openedChatIds.some((roomId) => roomId === room.id));

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
				<div className="p-2 shrink-0">
					<Input icon={<UserIcon className="h-5 w-5" />} label="Search" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
				</div>
				<List className="overflow-scroll">
					<Accordion
						open={openFriends}
						icon={<ChevronDownIcon strokeWidth={2.5} className={`mx-auto h-4 w-4 transition-transform ${openFriends ? 'rotate-180' : ''}`} />}
					>
						<ListItem className="p-0" selected={openFriends} ripple={false}>
							<AccordionHeader onClick={() => setOpenFriends(!openFriends)} className="border-b-0 p-3">
								<ListItemPrefix>
									<UsersIcon className="h-5 w-5" />
								</ListItemPrefix>
								<Typography color="blue-gray" className="mr-auto font-normal">
									Friends
								</Typography>
							</AccordionHeader>
						</ListItem>
						<AccordionBody className="py-1 overflow-scroll">
							<List className="p-0">
								<ListItem>
									<ListItemPrefix>
										<ChevronRightIcon strokeWidth={3} className="h-3 w-5" />
									</ListItemPrefix>
									Analytics
								</ListItem>
							</List>
						</AccordionBody>
					</Accordion>
					<Accordion
						open={openRooms}
						icon={<ChevronDownIcon strokeWidth={2.5} className={`mx-auto h-4 w-4 transition-transform ${openRooms ? 'rotate-180' : ''}`} />}
					>
						<ListItem className="p-0" selected={openRooms} ripple={false}>
							<AccordionHeader onClick={() => setOpenRooms(!openRooms)} className="border-b-0 p-3">
								<ListItemPrefix>
									<ChatBubbleBottomCenterTextIcon className="h-5 w-5" />
								</ListItemPrefix>
								<Typography color="blue-gray" className="flex mr-auto font-normal gap-2">
									Rooms
									<Chip value={filteredRooms.length} variant="ghost" size="sm" className="rounded-full" />
								</Typography>
							</AccordionHeader>
							<IconButton variant="text" color="blue-gray" onClick={() => setOpenCreateRoom(true)}>
								<PlusIcon className="h-5 w-5" />
							</IconButton>
						</ListItem>
						<AccordionBody className="py-1 overflow-scroll">
							<List className="p-0">
								{filteredRooms.map((room: Room) => {
									return (
										<ListItem ripple={false} selected={openedChatIds.some((id) => id === room.id)}>
											<RoomInfo key={room.id} room={room} onClick={() => openChat(room.id)} />
										</ListItem>
									);
								})}
							</List>
						</AccordionBody>
					</Accordion>
				</List>
			</div>
			<CreateRoom open={openCreateRoom} handleOpen={handleCreateRoom} />
		</>
	);
}
