import { Link, Outlet } from 'react-router-dom';
import { useMe } from '../hooks/useUser';
import { useSocketContext } from '../hooks/useContext';
import { ChatPanel } from './Chat/ChatPanel';
import { Navigation } from '../components/navigation';
import { Button, Dialog, DialogBody, Typography, Spinner } from '@material-tailwind/react';
import { useStoreDispatchContext } from '../hooks/useContext';
import { useNavigate } from 'react-router-dom';

export const DashboardLayout = () => {
	const { isLoading, loggedIn } = useMe();
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

	return (
		<div className="absolute inset-0 flex flex-col h-screen w-screen" style={{ backgroundColor: '#3f413e' }}>
			<Navigation />
			<div className="flex flex-row justify-end h-full overflow-hidden">
				<div className="w-full h-full flex flex-col">
					<Outlet />
				</div>
				<ChatPanel />
			</div>
		</div>
	);
};
