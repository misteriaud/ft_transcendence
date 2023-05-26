import { Link, Outlet } from 'react-router-dom';
import { useMe, useUser } from '../hooks/useUser';
import { Spinner } from '@material-tailwind/react';
import { useStoreDispatchContext, useSocketContext } from '../hooks/useContext';
import { StoreActionType } from '../context/storeProvider';
import { ChatPanel } from './Chat/ChatPanel';
import { User } from '../components/User';
import { Navbar } from '../components/Navbar';

export const DashboardLayout = () => {
	const { isLoading, loggedIn, me } = useMe();
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
			<Navbar />
			<div className="flex flex-row-reverse h-full">
				<ChatPanel />
				<Outlet />
				<User userId={me.id} />
			</div>
		</div>
	);
};
