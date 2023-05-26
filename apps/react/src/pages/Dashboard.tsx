import { Link, Outlet } from 'react-router-dom';
import { useMe, useUser } from '../hooks/useUser';
import { Spinner } from '../components/Spinner';
import { useStoreDispatchContext, useSocketContext } from '../hooks/useContext';
import { StoreActionType } from '../context/storeProvider';
import { ChatPanel } from './Chat/ChatPanel';
import logo from '../images/logoFlame.png';
import { SidebarLayout } from '../components/SidebarLayout';

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
		<>
			<nav id="main-nav" className="bg-slate-200 shadow p-4 flex items-center justify-between mb-3">
				<Link to="/dashboard/users/:username" className="flex items-center">
					<img src={logo} className="w-7 mr-4" alt="logo" />
					<span className="text-lg text-orange-500">
						<strong className="text-red-500">42 Trans</strong>cendence
					</span>
				</Link>
				<button className={`flex items-center text-sky-700 group hover:text-gray-400 active:text-black`} onClick={logout}>
					Logout&nbsp;
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="#010885"
						className="w-5 h-5 stroke-sky-700 group-hover:stroke-gray-400 group-active:stroke-black"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
						/>
					</svg>
				</button>
			</nav>
			<SidebarLayout outlet={<Outlet />} />
		</>
	);
};
