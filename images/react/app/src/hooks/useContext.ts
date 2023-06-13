import { useContext } from 'react';
import { e_user_status } from '../components/interfaces';
import { StoreContext, StoreDispatchContext, SocketContext, StoreAction, NotificationContext, PresenceContext } from '../context/storeProvider';

export function useStoreContext() {
	return useContext(StoreContext);
}
export function useStoreDispatchContext(): React.Dispatch<StoreAction> {
	const dispatch = useContext(StoreDispatchContext);
	if (dispatch === undefined) {
		throw new Error('useStoreDispatchContext must be used within a StoreProvider');
	}
	return dispatch;
}

export function useSocketContext() {
	const context = useContext(SocketContext);
	if (!context) throw new Error('socketContext must be used within a StoreProvider');
	return { isConnected: !!context.current, socket: context.current };
}

export function useNotificationContext() {
	const context = useContext(NotificationContext);
	if (!context) throw new Error('notificationContext must be used within a StoreProvider');
	return { notify: context };
}

export function usePresenceContext() {
	const presences = useContext(PresenceContext);

	const onlineIds: number[] = [];
	const inQueueIds: number[] = [];
	const inGameIds: number[] = [];

	presences.forEach((status, id) => {
		switch (status) {
			case e_user_status.ONLINE:
				onlineIds.push(id);
				break;
			case e_user_status.INGAME:
				inGameIds.push(id);
				break;
			case e_user_status.INQUEUE:
				inQueueIds.push(id);
				break;
		}
	});

	return { onlineIds, inGameIds, inQueueIds };
}

export function getStatus(id: number) {
	const presences = useContext(PresenceContext);

	const status = presences.get(id);
	return status ? status : e_user_status.OFFLINE;
}
