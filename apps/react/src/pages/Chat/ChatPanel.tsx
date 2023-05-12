import { useEffect, useState } from "react";
import { Spinner } from "../../components/Spinner";
import { useApi, useCustomSWR } from "../../dataHooks/axiosFetcher";
import { useSocketContext } from "../../providers/storeProvider";
import { useMe } from "../../dataHooks/useUser";

function CreateRoom({ action }: { action: any }) {
  const [name, setName] = useState("");
  const [access, setAccess] = useState("PRIVATE");
  const [password, setPassword] = useState("");

  function submit(e: any) {
    e.preventDefault();
    action(name, access, password);
  }

  return (
    <form onSubmit={submit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="name"
      ></input>
      <select value={access} onChange={(e) => setAccess(e.target.value)}>
        <option value="PRIVATE">Private</option>
        <option value="PROTECTED">Protected</option>
        <option value="PUBLIC">Public</option>
      </select>
      {access == "PROTECTED" ? (
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="name"
        ></input>
      ) : null}
    </form>
  );
}

function Chat({ room, sendMessage }: any) {
  const [chatInput, setChatInput] = useState("");
  const { me } = useMe();

  return (
    <>
      <ul className="overflow-scroll flex flex-col">
        {room.messages.map((message: Message) => (
          <li
            key={message.id}
            className={`flex-shrink min-w-0 self-${
              message.sendBy == me.id ? "end" : "start"
            } rounded-md bg-white bg-opacity-90 px-1 py-0.5 m-1`}
          >
            {message.content}
          </li>
        ))}
      </ul>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (chatInput) await sendMessage(room, chatInput);
          setChatInput("");
        }}
        className="flex static bottom-0 left-0 right-0"
      >
        <input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="message"
          className="w-full p-1"
        ></input>
      </form>
    </>
  );
}

function Box({ title, children, color, close }: any) {
  const [isFold, setIsFold] = useState(false);
  return (
    <li
      className={`self-end flex flex-col justify-content overflow-auto w-48 max-h-80 mr-2 border-2 border-black/20 shadow-lg shadow-[0_-20px_30px_-15px_rgba(0,0,0,0.3)] overflow-hidden rounded-t-lg bg-${color}-400`}
    >
      <div
        className={`flex justify-around items-center bg-black bg-opacity-20 cursor-pointer hover:bg-${color}-500`}
        onClick={() => setIsFold(!isFold)}
      >
        {title}
        {close && (
          <button
            onClick={close}
            className="m-2 w-6 h-6 flex justify-center items-center rounded-full bg-black bg-opacity-10 hover:bg-opacity-20"
          >
            X
          </button>
        )}
      </div>
      <div className="flex-shrink min-h-0 overflow-scroll flex flex-col">
        {!isFold && children}
      </div>
    </li>
  );
}

interface Message {
  id: number;
  sendBy: number;
  content: string;
}

interface Room {
  id: number;
  name: string;
  access: string;
  messages: Message[];
}

function RoomDesc({
  room,
  openChat,
}: {
  room: Room;
  openChat: (room: Room) => void;
}) {
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
                access: room.access,
              },
            },
          ],
        });
      })
      .catch((error) => {
        console.log(error);
        // setTotp("");
        // setIsError(true);
      });
  }

  const isMember = me.memberOf.some(
    (member: { room: Room }) => room.id === member.room.id
  );

  return (
    <div className="bg-black bg-opacity-20 even:bg-opacity-10 flex justify-between">
      <button key={room.id} onClick={() => openChat(room)}>
        {room.name}
      </button>
      <button
        className="p-1 m-1 rounded-md bg-black bg-opacity-20"
        onClick={joinChat}
      >
        {isMember ? "leave" : "join"}
      </button>
    </div>
  );
}

export function ChatPanel() {
  const { loading, data, error, mutate } = useCustomSWR("/rooms");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [openedChat, setOpenedChat] = useState<Room[]>([]);
  const { isConnected, socket } = useSocketContext();
  const { me } = useMe();
  const api = useApi();

  useEffect(() => {
    if (!data) return;
    let temp = data.map((room: Room) => {
      return {
        ...room,
        messages: [],
      };
    });
    temp.forEach((room: Room) => {
      let tmp_room = rooms.find((localRoom: Room) => room.id == localRoom.id);
      if (tmp_room) room.messages = tmp_room.messages;
      else room.messages = [];
    });
    setRooms(temp);
  }, [data]);
  useEffect(() => {
    if (!isConnected) return;
    socket.on("message", ({ id, roomId, sendBy, content }) => {
      addMessage(id, roomId, sendBy, content);
    });
    return () => {
      socket.off("message");
    };
  }, [isConnected]);

  console.log(rooms);

  if (loading) return null;
  // return (<Spinner />)

  if (error) return <h1>Error</h1>;

  async function createRoom(name: string, access: string, password: string) {
    await api
      .post("rooms", {
        name,
        access,
        password,
      })
      .then((result) => {
        if (access != "PRIVATE")
          mutate([
            ...data,
            {
              id: data.length + 1,
              name,
              access,
            },
          ]);
      })
      .catch(() => {
        // setTotp("");
        // setIsError(true);
      });
  }

  function openChat(roomToOpen: Room) {
    if (openedChat.findIndex((room: Room) => room.id === roomToOpen.id) == -1)
      setOpenedChat([...openedChat, roomToOpen]);
    // else
    // 	closeChat(roomToOpen)
  }

  function closeChat(roomToClose: Room) {
    setOpenedChat(openedChat.filter((room: Room) => room.id != roomToClose.id));
  }

  async function sendMessage(roomToSend: Room, message: string) {
    if (!isConnected) return;
    socket.emit("message", {
      roomId: roomToSend.id,
      content: message,
    });
  }

  function addMessage(
    id: number,
    roomId: number,
    sendBy: number,
    content: string
  ) {
    let tmp = [...rooms];

    tmp
      .find((room: Room) => room.id === roomId)
      ?.messages.push({
        id,
        sendBy,
        content,
      });
    setRooms(tmp);
  }

  return (
    <ul className="absolute bottom-0 right-0 flex flex-row">
      {openedChat.map((room: Room) => {
        return (
          <Box
            title={room.name}
            color="green"
            close={() => closeChat(room)}
            key={room.id}
          >
            <Chat room={room} sendMessage={sendMessage} />
          </Box>
        );
      })}
      <Box title="Chat" color="blue" key="main">
        <CreateRoom action={createRoom} />
        {rooms.map((room: Room) => {
          return <RoomDesc room={room} openChat={openChat} key={room.id} />;
        })}
      </Box>
    </ul>
  );
}
