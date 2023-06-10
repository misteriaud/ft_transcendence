import '../styles/Home.css';
import { Link } from 'react-router-dom';
import { Typography, Button } from '@material-tailwind/react';
import Logo42 from '../images/logo42.png';

export default function Home() {
	return (
		<div className="background-img flex flex-col items-center justify-center">
			<Typography variant="paragraph" color="blue-gray" className="font-mono text-4xl mb-5">
				Welcome to our Transcendence project
			</Typography>
			<img src={Logo42} className="h-28 mr-3 mb-4" />
			<Link to="/login">
				<Button size="lg" color="gray" ripple={true} className="py-2 px-20 rounded-lg">
					<Typography variant="paragraph" className="text-lg">
						Login
					</Typography>
				</Button>
			</Link>
		</div>
	);
}
