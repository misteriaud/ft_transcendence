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

function ChatBox({ room }: any) {
	const { isConnected, socket } = useSocketContext()
	const [chatInput, setChatInput] = useState("");
	const [messages, setMessages] = useState<string[]>([]);

	useEffect(() => {
		if (!isConnected)
			return
		socket.on("room-" + room.id, (event) => {
			addMessage(event)
		})
		return () => {socket.off("room-" + room.id)}
	}, [isConnected])

	function sendMessage(e: any) {
		e.preventDefault()
		if (!isConnected)
			return
		socket.emit("message", {
			id: room.id,
			content: chatInput
		})
		addMessage(chatInput)
		setChatInput("");
	}

	function addMessage(message: string) {
		setMessages([...messages, message])
	}

	return (
		<div>
			<ul>
				{
					messages.map((message, key) => (<li key={key}>{message}</li>))
				}
			</ul>
			<form onSubmit={sendMessage}>
				<input value={chatInput} onChange={(e) => setChatInput(e.target.value)}></input>
			</form>
		</div>
	)
}

export function ChatPanel() {
	const { JWT } = useStoreContext();
	const { loading, data, error, mutate } = useCustomSWR("/rooms");
	const [openedChat, setOpenedChat] = useState<any>([]);

	if (loading)
		return (<Spinner />)

	if (error)
		return (<h1>Error</h1>)

	async function createRoom(name: string, access: string, password: string) {
		await apiProvider(JWT)
			.post("rooms", {
				name,
				access,
				password
			})
			.then((result) => {
				if (access != "PRIVATE")
					mutate([
						...data,
						{
							id: data.length + 1,
							name,
							access
						}
					])
			})
			.catch(() => {
				// setTotp("");
				// setIsError(true);
			});

	}

	const roomList = data.map((room: any) => {
		return (<button key={room.id} onClick={() => setOpenedChat([...openedChat, room])}>{room.name}</button>)
	})


	return (
		<div>Chat Panel
			<CreateRoom action={createRoom} />
			<ul>{roomList}</ul>
			{openedChat.map((room: any ) => {
				return (<ChatBox key={room.id} room={room} />)
			})}
		</div>
	)
}
