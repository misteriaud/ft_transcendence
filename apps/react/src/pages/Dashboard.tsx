import { Link, Outlet } from 'react-router-dom';
import { useMe } from '../hooks/useUser';
import { Spinner } from '../components/Spinner';
import { useSocketContext } from '../hooks/useContext';
import { ChatPanel } from './Chat/ChatPanel';
import { Me } from '../components/me';

export const DashboardLayout = () => {
	const { isLoading, loggedIn } = useMe();
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

	return (
		<div className="absolute inset-0 bg-orange-400 flex flex-col">
			<nav className="h-12 bg-green-300 flex flex-row justify-between">
				<Link to="settings">Settings</Link>
				<Me key="abcd" />
			</nav>
			<Outlet />
			<ChatPanel />
		</div>
	);
};
