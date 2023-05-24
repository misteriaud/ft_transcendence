import { useEffect, useState, useRef } from 'react';
import { useCustomSWR } from '../../hooks/useApi';
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
	Select,
	Option
} from '@material-tailwind/react';

function CreateRoom({ open, handleOpen }: { open: boolean; handleOpen: () => void }) {
	const [name, setName] = useState('');
	const [access, setAccess] = useState('PRIVATE');
	const [password, setPassword] = useState('');

	function submit(e: any) {
		e.preventDefault();
		// action(name, access, password);
	}

	return (
		<Dialog open={open} handler={handleOpen} size="xs">
			<DialogHeader>Its a simple dialog.</DialogHeader>
			<DialogBody divider>
				<form onSubmit={submit}>
					<Input value={name} onChange={(e) => setName(e.target.value)} label="name"></Input>
					<Select label="Select Version">
						<Option value="PRIVATE">Private</Option>
						<Option value="PROTECTED">Protected</Option>
						<Option value="PUBLIC">Public</Option>
					</Select>
					{access == 'PROTECTED' ? <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="name"></input> : null}
				</form>
			</DialogBody>
			<DialogFooter>
				<Button variant="text" color="red" onClick={handleOpen} className="mr-1">
					<span>Cancel</span>
				</Button>
				<Button variant="gradient" color="green" onClick={handleOpen}>
					<span>Confirm</span>
				</Button>
			</DialogFooter>
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

	const rooms: Room[] = me.memberOf.map((member: any) => member.room);
	const openedChat = rooms.filter((room: Room) => openedChatIds.some((roomId) => roomId === room.id));

	return (
		<ul className="absolute bottom-0 right-0 flex flex-row">
			{openedChat.map((room: Room) => {
				return (
					<Box title={<RoomInfo room={room} />} color="green" close={() => closeChat(room.id)} key={room.id}>
						<Chat roomInfo={room} />
					</Box>
				);
			})}
			<Box title={<ChatSettings />} color="blue" key="main">
				{/* <CreateRoom action={createRoom} /> */}
				{rooms.map((room: Room) => {
					return (
						<div className="bg-black bg-opacity-20 even:bg-opacity-10 flex justify-between px-4">
							<RoomInfo key={room.id} room={room} onClick={() => openChat(room.id)} />
						</div>
					);
				})}
			</Box>
		</ul>
	);
}
