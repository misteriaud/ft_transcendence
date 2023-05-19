import { createContext, useContext, useEffect, useRef } from 'react';
import { useOutlet } from 'react-router-dom';
import { useLocalStorageReducer } from '../hooks/useLocalStorage';
import { io, Socket } from 'socket.io-client';

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

/**
 * Context initialization
 */
export const StoreContext = createContext({} as StoreState);
export const StoreDispatchContext = createContext<React.Dispatch<StoreAction> | undefined>(undefined);
export const SocketContext = createContext<React.MutableRefObject<Socket> | null>(null);

/**
 * React component to serve the context, storing and retreiving this context in LocalStorage
 * @returns React Component
 */
export function StoreProvider() {
	const outlet = useOutlet();
	const [store, dispatch] = useLocalStorageReducer('store', storeReducer, {});
	const socketRef: React.MutableRefObject<Socket> = useRef() as React.MutableRefObject<Socket>;

	useEffect(() => {
		if (!store.JWT) return;
		console.log('set socket');
		socketRef.current = io('ws://localhost:8080/', {
			auth: {
				token: store.JWT
			}
		});
		socketRef.current.on('connect_error', (event: any) => {
			dispatch({
				type: StoreActionType.SOCKET_ERROR,
				content: event.data
			});
		});
		return () => {
			socketRef.current.close();
		};
	}, [store.JWT]);

	return (
		<StoreContext.Provider value={store}>
			<StoreDispatchContext.Provider value={dispatch}>
				<SocketContext.Provider value={socketRef}>{outlet}</SocketContext.Provider>
			</StoreDispatchContext.Provider>
		</StoreContext.Provider>
	);
}

/**
 * reducer used in the StoreProvider
 *
 * @param state
 * @param action
 * @returns
 */
function storeReducer(state: StoreState, action: StoreAction): StoreState {
	switch (action.type) {
		case StoreActionType.LOGIN: {
			const JWT: string = action.content;
			return {
				...state,
				JWT
			};
		}
		case StoreActionType.LOGOUT: {
			delete state.JWT;
			return state;
		}
		case StoreActionType.SOCKET_ERROR: {
			console.log('socket error');
			return state;
		}
		default: {
			throw Error('Unknown action: ' + action.type);
		}
	}
}
