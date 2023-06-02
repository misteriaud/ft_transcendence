import '../styles/Home.css';
import { Link } from 'react-router-dom';
import { useAlertContext } from '../hooks/useContext';
import { useEffect } from 'react';
import { Typography } from '@material-tailwind/react';

function Home() {
	const { alert } = useAlertContext();

	useEffect(() => {
		alert({ elem: <Typography>Test</Typography> });
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
