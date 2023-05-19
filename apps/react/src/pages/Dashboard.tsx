import { Link, Outlet } from 'react-router-dom';
import { useMe, useUser } from '../hooks/useUser';
import { Spinner } from '../components/Spinner';
import { useStoreDispatchContext, useSocketContext } from '../hooks/useContext';
import { StoreActionType } from '../context/storeProvider';
import { ChatPanel } from './Chat/ChatPanel';

export const DashboardLayout = () => {
	const { isLoading, loggedIn } = useMe();
	const dispatch = useStoreDispatchContext();
	const { isConnected, socket } = useSocketContext();

	if (isLoading) return <Spinner />;

	if (!loggedIn) {
		return (
			<>
				<h1>Your are not connected yet</h1>
				<Link to="/login">login</Link>
			</>
		);
	}

	function logout() {
		dispatch({
			type: StoreActionType.LOGOUT
		});
		window.location.reload();
	}

	return (
		<div className="absolute inset-0 bg-orange-400 flex flex-col">
			<nav className="h-12 bg-green-300 flex flex-row justify-between">
				<Link to="settings">Settings</Link>
				<button onClick={logout}>Logout</button>
			</nav>
			<Outlet />
			<ChatPanel />
		</div>
	);
};
