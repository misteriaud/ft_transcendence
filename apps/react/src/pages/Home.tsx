import '../styles/Home.css';
import { Link } from 'react-router-dom';
import { Typography, Button } from '@material-tailwind/react';
import Logo42 from '../images/logo42.png';
import Flame from '../images/logoFlame.png';

function Home() {
	return (
		<div className="background-img flex flex-col items-center justify-center">
			{/* <div className="mb-20 flex flex-col items-center justify-center"> */}
			{/* <img src={Flame} className="h-2/6 opacity-50 mb-20" /> */}
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
			{/* </div> */}
		</div>
	);
}

export default Home;

// "blue-gray" | "gray" | "brown" | "deep-orange" | "orange" | "amber" | "yellow" | "lime" | "light-green" | "green" | "teal" | "cyan" | "light-blue" | "blue" | "indigo" | "deep-purple" | "purple" | "pink" | "red";
