import { Link, Outlet } from "react-router-dom";
import { useMe, useUser } from "../dataHooks/useUser";
import { Spinner } from "../components/Spinner";
import {
	useStoreDispatchContext,
	StoreActionType,
	useSocketContext,
} from "../providers/storeProvider";
import { ChatPanel } from "./Chat/ChatPanel";

export const DashboardLayout = () => {
	const { loading, loggedOut } = useMe();
	const dispatch = useStoreDispatchContext();
	const {isConnected, socket} = useSocketContext()

	if (loading) return <Spinner />;

	if (loggedOut) {
		return (
			<>
				<h1>Your are not connected yet</h1>
				<Link to="/login">login</Link>
			</>
		);
	}

	function logout() {
		dispatch({
			type: StoreActionType.LOGOUT,
		});
		window.location.reload();
	}

	function sendMessage() {
		if (isConnected)
			socket.emit("message", "hfuowehfuowe")
	}

	return (
		<>
			<nav>
				<Link to="settings">Settings</Link>
				<button onClick={logout}>Logout</button>
				<button onClick={sendMessage}>Send Message</button>
			</nav>
			<ChatPanel />
			<Outlet />
		</>
	);
};
