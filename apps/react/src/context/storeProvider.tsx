import React, { createContext, useContext, useEffect, useRef, useState, createElement, ReactElement } from 'react';
import { useOutlet } from 'react-router-dom';
import { useLocalStorageReducer } from '../hooks/useLocalStorage';
import { io, Socket } from 'socket.io-client';
import { Alert, Button, IconButton } from '@material-tailwind/react';
import { nanoid } from 'nanoid';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import { XMarkIcon } from '@heroicons/react/24/solid';

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
export const NotificationContext = createContext<
	(({ elem, color, icon, timer }: { elem: ReactElement; color?: AlertColor; icon?: React.ReactNode; timer?: number }) => void) | null
>(null);

type AlertColor =
	| 'blue-gray'
	| 'gray'
	| 'brown'
	| 'deep-orange'
	| 'orange'
	| 'amber'
	| 'yellow'
	| 'lime'
	| 'light-green'
	| 'green'
	| 'teal'
	| 'cyan'
	| 'light-blue'
	| 'blue'
	| 'indigo'
	| 'deep-purple'
	| 'purple'
	| 'pink'
	| 'red';

interface Notification {
	id: string;
	elem: ReactElement;
	color: AlertColor;
	icon?: React.ReactNode;
	timer: number;
}

/**
 * React component to serve the context, storing and retreiving this context in LocalStorage
 * @returns React Component
 */
export function StoreProvider() {
	const outlet = useOutlet();
	const [store, dispatch] = useLocalStorageReducer('store', storeReducer, {});
	const [alerts, setAlerts] = useState<Notification[]>([]);
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
			console.log('unset socket');
			socketRef.current.close();
		};
	}, [store.JWT]);

	const addAlert = ({ elem, color = 'blue', icon, timer = 10 }: { elem: ReactElement; color?: AlertColor; icon?: React.ReactNode; timer?: number }) => {
		const id = nanoid();
		setAlerts([
			{
				id,
				elem,
				color,
				icon,
				timer
			},
			...alerts
		]);
		// if (timer > 0)
		// 	setTimeout(() => {
		// 		setAlerts(alerts.filter((alert) => alert.id !== id));
		// 	}, 1000 * timer);
	};

	const removeAlert = (toRemoveId: string) => {
		setAlerts(alerts.filter(({ id }: Notification) => id !== toRemoveId));
	};

	const alertComp = alerts.map((alert) => {
		return (
			<Alert
				open={true}
				onClose={() => removeAlert(alert.id)}
				action={
					<Button
						className="static flex justify-center items-center p-2 ml-auto"
						variant="text"
						color="white"
						onClick={(e) => {
							e.stopPropagation();
							removeAlert(alert.id);
						}}
					>
						<XMarkIcon className="static h-6 w-6 text-white" />
					</Button>
				}
				icon={alert.icon}
				color={alert.color}
				className="flex items-center my-2 p-2 shadow-2xl w-full"
				key={alert.id}
			>
				<div className="flex justify-center items-center gap-2 pl-2">
					{alert.timer > 0 && (
						<CountdownCircleTimer isPlaying duration={alert.timer} colors={'#2196f3'} size={20} strokeWidth={2} onComplete={() => removeAlert(alert.id)} />
					)}
					{alert.elem}
				</div>
			</Alert>
		);
	});

	return (
		<StoreContext.Provider value={store}>
			<StoreDispatchContext.Provider value={dispatch}>
				<SocketContext.Provider value={socketRef}>
					<NotificationContext.Provider value={addAlert}>
						<div className="absolute max-h-[30vh] left-1/2 -translate-x-1/2 flex flex-col-reverse overflow-y-scroll z-[42000]">{alertComp}</div>
						{outlet}
					</NotificationContext.Provider>
				</SocketContext.Provider>
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
