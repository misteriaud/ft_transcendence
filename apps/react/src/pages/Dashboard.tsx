import { Link, Outlet } from 'react-router-dom';
import { useMe, useUser } from '../hooks/useUser';
import { Button, Dialog, DialogBody, DialogFooter, Spinner, Typography } from '@material-tailwind/react';
import { useStoreDispatchContext, useSocketContext } from '../hooks/useContext';
import { StoreActionType } from '../context/storeProvider';
import { ChatPanel } from './Chat/ChatPanel';
import { Navbar } from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

export const DashboardLayout = () => {
	const { isLoading, loggedIn, me } = useMe();
	const dispatch = useStoreDispatchContext();
	const { isConnected, socket } = useSocketContext();
	const navigate = useNavigate();

	if (isLoading) return <Spinner />;

	if (!loggedIn) {
		return (
			<Dialog
				size="xs"
				open={true}
				handler={() => {
					return;
				}}
			>
				<DialogBody className="flex flex-col items-center justify-center text-center gap-6">
					<Typography variant="h4">You are not connected yet, please click on the link to login</Typography>
					<Button
						variant="gradient"
						className="mr-1"
						onClick={() => {
							navigate('/login');
						}}
					>
						<span>Login</span>
					</Button>
				</DialogBody>
			</Dialog>
		);
	}

	function logout() {
		dispatch({
			type: StoreActionType.LOGOUT
		});
		window.location.reload();
	}

	return (
		<div className="absolute inset-0 bg-orange-400 flex flex-col h-screen w-screen">
			<Navbar />
			<div className="flex flex-row justify-end h-full overflow-hidden">
				<Outlet />
				<ChatPanel />
			</div>
		</div>
	);
};
