import { Link, Outlet } from 'react-router-dom';
import { useMe } from '../hooks/useUser';
import { Spinner } from '../components/Spinner';
import { useSocketContext } from '../hooks/useContext';
import { ChatPanel } from './Chat/ChatPanel';
import { Me } from '../components/me';
import { Navigation } from '../components/navigation';

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
		<>
			<Navigation />
			{/* <nav className="h-12 bg-green-300 flex flex-row justify-between">
				<Link to="settings">Settings</Link>
			</nav> */}
			<div className="h-screen bg-orange-500"></div>
			<Outlet />
			<ChatPanel />
		</>
	);
};
