import { useEffect, useState } from "react";
import { Spinner } from "../../components/Spinner";
import { useCustomSWR } from "../../dataHooks/axiosFetcher";
import { apiProvider } from "../../dataHooks/axiosFetcher";
import { useSocketContext, useStoreContext } from "../../providers/storeProvider";

function CreateRoom({ action }: { action: any }) {
	const [name, setName] = useState("")
	const [access, setAccess] = useState("PRIVATE")
	const [password, setPassword] = useState("")

	function submit(e: any) {
		e.preventDefault();
		action(name, access, password)
	}

	return (
		<form onSubmit={submit}>
			<input value={name} onChange={(e) => setName(e.target.value)} placeholder="name"></input>
			<select value={access} onChange={(e) => setAccess(e.target.value)}>
				<option value="PRIVATE">Private</option>
				<option value="PROTECTED">Protected</option>
				<option value="PUBLIC">Public</option>
			</select>
			{access == "PROTECTED" ? <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="name"></input> : null}
		</form>
	)
}

function Chat({ room, sendMessage }: any) {
	const [chatInput, setChatInput] = useState("");

	return (
		<>
			<ul className="overflow-scroll">
				{
					room.messages.map((message: Message, key: string) => (<li key={key}>{message.content}</li>))
				}
			</ul>
			<form onSubmit={
				async (e) => {
					e.preventDefault()
					await sendMessage(room, chatInput)
					setChatInput("")
				}}
				className="flex static bottom-0 left-0 right-0"
			>
				<input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="message" className="w-full p-1"></input>
			</form>
		</>
	)
}

function Box({ title, children, color, close }: any) {
	const [isFold, setIsFold] = useState(false)
	return (
		<li className={`self-end flex flex-col justify-content overflow-auto w-48 max-h-80 mr-2 last:mr-0 border-2 border-black/20 shadow-lg shadow-[0_-20px_30px_-15px_rgba(0,0,0,0.3)] overflow-hidden rounded-t-lg bg-${color}-400`}>
			<div className="flex justify-around items-center bg-black bg-opacity-20">
				{title}
				<div className="flex">
					<button
						onClick={() => setIsFold(!isFold)}
						className="m-2 w-6 h-6 flex justify-center items-center rounded-full bg-black bg-opacity-10 hover:bg-opacity-20"
					>
						{isFold ? "+" : "-"}
					</button>
					{close &&
						<button
							onClick={close}
							className="m-2 w-6 h-6 flex justify-center items-center rounded-full bg-black bg-opacity-10 hover:bg-opacity-20"
						>
							X
						</button>
					}

				</div>
			</div>
			<div className="flex-shrink min-h-0 overflow-scroll flex flex-col">
				{!isFold && children}
			</div>
		</li>
	)
}

interface Message {
	id: string,
	sendBy: string,
	content: string,
}

interface Room {
	id: string,
	name: string,
	access: string,
	messages: Message[]
}

export function ChatPanel() {
	const { JWT } = useStoreContext();
	const { loading, data, error, mutate } = useCustomSWR("/rooms");
	const [rooms, setRooms] = useState<Room[]>([]);
	const [openedChat, setOpenedChat] = useState<Room[]>([]);
	const { isConnected, socket } = useSocketContext()

	useEffect(() => {
		if (!data)
			return
		let temp = data.map((room: Room) => {
					return {
						...room,
						messages: []
					}
				})
		temp.forEach((room: Room) => {
			let tmp_room = rooms.find((localRoom: Room) => room.id == localRoom.id)
			if (tmp_room)
				room.messages = tmp_room.messages;
			else
				room.messages = []
		});
		setRooms(temp)
	}, [data])
	useEffect(() => {
		if (!isConnected)
			return
		socket.on("message", (event) => {
			// addMessage(event)
		})
		return () => { socket.off("message") }
	}, [isConnected])

	if (loading)
		return (null)
		// return (<Spinner />)

	if (error)
		return (<h1>Error</h1>)

	// async function createRoom(name: string, access: string, password: string) {
	// 	await apiProvider(JWT)
	// 		.post("rooms", {
	// 			name,
	// 			access,
	// 			password
	// 		})
	// 		.then((result) => {
	// 			if (access != "PRIVATE")
	// 				mutate([
	// 					...data,
	// 					{
	// 						id: data.length + 1,
	// 						name,
	// 						access
	// 					}
	// 				])
	// 		})
	// 		.catch(() => {
	// 			// setTotp("");
	// 			// setIsError(true);
	// 		});

	// }

	function openChat(roomToOpen: Room) {
		if (openedChat.findIndex((room: Room) => room.id === roomToOpen.id) == -1)
			setOpenedChat([...openedChat, roomToOpen])
		// else
		// 	closeChat(roomToOpen)
	}

	function closeChat(roomToClose: Room) {
		setOpenedChat(openedChat.filter((room: Room) => room.id != roomToClose.id))
	}

	async function sendMessage(roomToSend: Room, message: string) {
		if (!isConnected)
			return
		// socket.emit("message", {
		// 	id: room.id,
		// 	content: chatInput
		// })
		let roomToUpdate: Room | undefined = rooms.find((room: Room) => room.id === roomToSend.id)
		if (!roomToUpdate)
			return
		roomToUpdate.messages.push({
			id: "fjwefjw",
			sendBy: "fwefwe",
			content: message
		})
		let tmp = rooms;
		tmp.find((room: Room) => room.id === roomToSend.id)?.messages.push({
			id: "fjwefjw",
			sendBy: "fwefwe",
			content: message
		})
		setRooms(tmp)
	}
	// .messages[]
	// addMessage(chatInput)
	// setChatInput("");

	return (
		<ul className="absolute bottom-0 right-0 flex flex-row">
			{openedChat.map((room: Room) => {
				return (
					<Box
						title={room.name}
						color="green"
						close={() => closeChat(room)}
					>
						<Chat key={room.id} room={room} sendMessage={sendMessage} />
					</Box>)
			})}
			<Box title="Chat" color="blue">
					{rooms.map((room: Room) => {
						return (<button key={room.id} onClick={() => openChat(room)} className="bg-black bg-opacity-20 even:bg-opacity-10 hover:bg-opacity-30">{room.name}</button>)
					})}
			</Box>
		</ul>
	)
}
