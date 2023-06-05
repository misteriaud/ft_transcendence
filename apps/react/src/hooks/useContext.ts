import { useContext } from 'react';
import { StoreContext, StoreDispatchContext, SocketContext, StoreAction, NotificationContext } from '../context/storeProvider';

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
	if (!context) throw new Error('socketContext must be used within a StoreProvider');
	return { notify: context };
}
