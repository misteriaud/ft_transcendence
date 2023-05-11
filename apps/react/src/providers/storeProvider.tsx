import { createContext, useContext, useEffect, useRef } from "react";
import { useOutlet } from "react-router-dom";
import { useLocalStorageReducer } from "../utils/useLocalStorage";
import { io, Socket } from "socket.io-client"

export interface StoreState {
	JWT?: string;
}

export enum StoreActionType {
	LOGIN,
	LOGOUT,
	SOCKET_MESSAGE,
	SOCKET_ERROR
}
export type StoreAction = { type: StoreActionType; content?: any };

// Context Creation

const StoreContext = createContext({} as StoreState);
const StoreDispatchContext = createContext<
	React.Dispatch<StoreAction> | undefined
>(undefined);
const SocketContext = createContext<React.MutableRefObject<Socket> | null>(null);


// COMPONENT

export function StoreProvider() {
	const outlet = useOutlet();
	const [store, dispatch] = useLocalStorageReducer(
		"store",
		storeReducer,
		{}
	);
	const socketRef: React.MutableRefObject<Socket> = useRef() as React.MutableRefObject<Socket>;

	useEffect(() => {
		if (!store.JWT)
			return
		console.log("set socket")
		socketRef.current = io("ws://localhost:8080/",
			{
				extraHeaders: {
					"Authorization": store.JWT
				}
			});
		// socketRef.current.on("connect_error", (event: any) => {
		// 	dispatch({
		// 		type: StoreActionType.SOCKET_ERROR,
		// 		content: event.data
		// 	})
		// });
		return () => { socketRef.current.close() }
	}, [store.JWT])

	return (
		<StoreContext.Provider value={store}>
			<StoreDispatchContext.Provider value={dispatch}>
				<SocketContext.Provider value={socketRef}>
					{outlet}
				</SocketContext.Provider>
			</StoreDispatchContext.Provider>
		</StoreContext.Provider>
	);
}

export function useStoreContext() {
	return useContext(StoreContext);
}
export function useStoreDispatchContext(): React.Dispatch<StoreAction> {
	const dispatch = useContext(StoreDispatchContext);
	if (dispatch === undefined) {
		throw new Error(
			"useStoreDispatchContext must be used within a StoreProvider"
		);
	}
	return dispatch;
}

export function useSocketContext() {
	const context = useContext(SocketContext);
	if (!context)
		throw new Error(
			"socketContext must be used within a StoreProvider"
		);
	return { isConnected: !!context.current, socket: context.current }
}

function storeReducer(state: StoreState, action: StoreAction): StoreState {
	switch (action.type) {
		case StoreActionType.LOGIN: {
			const JWT: string = action.content;
			return {
				...state,
				JWT,
			};
		}
		case StoreActionType.LOGOUT: {
			delete state.JWT
			return state
		}
		default: {
			throw Error("Unknown action: " + action.type);
		}
	}
}

