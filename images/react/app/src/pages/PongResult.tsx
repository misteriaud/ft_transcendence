import { Card, CardHeader, CardBody, CardFooter, Typography, Button, Spinner } from '@material-tailwind/react';
import { useCustomSWR } from '../hooks/useApi';
import { useParams, useNavigate } from 'react-router-dom';

export function PongResultPage() {
	const { gameId } = useParams();
	const navigate = useNavigate();
	const { data, error, isLoading } = useCustomSWR(`/pong/${gameId}`);
	const navigateTo = () => {
		navigate(`/dashboard`);
	};

	if (isLoading || !data || error) {
		return <Spinner />;
	}

	return (
		<div className="flex flex-col justify-center items-center justify-center h-full w-full" style={{ backgroundColor: '#3f413e' }}>
			<Card className="bg-gray-100 mt-6 w-96 transform hover:scale-105 transition-transform duration-200">
				<CardHeader className="relative h-56 from-slate-300">
					<img src="https://www.pngarts.com/files/17/Game-Over-PNG-Image.png" alt="img-blur-shadow" className="w-full h-full object-cover opacity-75" />
				</CardHeader>
				<CardBody className="rounded-lg shadow-inner p-6">
					<Typography variant="h5" className="mb-4 text-center font-semibold text-gray-700">
						SCORES
					</Typography>
					<Typography className="text-lg text-center font-extrabold text-blue-500 mb-2">
						{data.playedBy[1].username}: {data.score1} PTS
					</Typography>
					<Typography className="text-lg text-center font-extrabold text-indigo-500">
						{data.playedBy[0].username}: {data.score2} PTS
					</Typography>
				</CardBody>
				<CardFooter className=" rounded-b-lg p-4">
					<div className="flex flex-col items-center">
						<Button onClick={navigateTo}>Return to Dashboard</Button>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
