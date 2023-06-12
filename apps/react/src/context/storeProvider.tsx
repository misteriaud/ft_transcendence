import React, { createContext, useEffect, useRef, useState, ReactElement } from 'react';
import { useOutlet } from 'react-router-dom';
import { useLocalStorageReducer } from '../hooks/useLocalStorage';
import { io, Socket } from 'socket.io-client';
import { Alert, Button } from '@material-tailwind/react';
import { nanoid } from 'nanoid';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import { e_user_status } from '../components/interfaces';
import { Subject } from 'rxjs';
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

export interface ObservableNotification {
	type: 'chat' | 'game';
	content: any;
}

/**
 * Context initialization
 */
export const StoreContext = createContext({} as StoreState);
export const StoreDispatchContext = createContext<React.Dispatch<StoreAction> | undefined>(undefined);
export const SocketContext = createContext<React.MutableRefObject<Socket> | null>(null);
export const NotificationContext = createContext<
	(({ elem, color, icon, timer }: { elem: ReactElement; color?: AlertColor; icon?: React.ReactNode; timer?: number }) => void) | null
>(null);
export const PresenceContext = createContext<Map<number, e_user_status>>(new Map());
export const ObservableContext = createContext<Subject<ObservableNotification>>(new Subject());

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
	const [presences, setPresences] = useState<Map<number, e_user_status>>(new Map());
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
		socketRef.current.on('presence/init', (initialPresenses: [number, e_user_status][]) => {
			setPresences(new Map(initialPresenses));
			// console.log('presence/init', new Map(initialPresenses));
		});
		// socketRef.current.onAny((eventName: string, ...args) => {
		// 	console.log('LOGS: ', eventName, args);
		// 	// ...
		// });
		return () => {
			console.log('unset socket');
			socketRef.current.close();
		};
	}, [store.JWT]);

	useEffect(() => {
		socketRef.current?.on('presence/update', ({ id, status }: { id: number; status: e_user_status }) => {
			const newMap = new Map(presences);
			if (status == e_user_status.OFFLINE) newMap.delete(id);
			else newMap.set(id, status);
			setPresences(newMap);
			// console.log('presence/update', newMap, id);
		});
	}, [socketRef, presences]);

	const addAlert = ({ elem, color = 'blue', icon, timer = 5 }: { elem: ReactElement; color?: AlertColor; icon?: React.ReactNode; timer?: number }) => {
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
						<PresenceContext.Provider value={presences}>
							<div className="absolute max-h-[30vh] left-1/2 -translate-x-1/2 flex flex-col-reverse overflow-y-scroll z-[10000]">{alertComp}</div>
							{outlet}
						</PresenceContext.Provider>
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
