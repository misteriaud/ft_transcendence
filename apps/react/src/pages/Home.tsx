import '../styles/Home.css';
import { Link } from 'react-router-dom';
import { useNotificationContext } from '../hooks/useContext';
import { useEffect } from 'react';
import { Typography } from '@material-tailwind/react';

function Home() {
	const { notify } = useNotificationContext();

	useEffect(() => {
		notify({ elem: <Typography>Test</Typography> });
	}, []);
	return (
		<div className="background-img">
			<div className="title-container">
				<h1>PONG</h1>
				<Link to="/login" className="login-button">
					Login
				</Link>
			</div>
		</div>
	);
}

export default Home;
