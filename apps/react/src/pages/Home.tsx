import '../styles/Home.css';
import { Link } from 'react-router-dom';

function Home() {
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
