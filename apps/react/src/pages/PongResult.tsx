import { Card, CardHeader, CardBody, CardFooter, Typography, Button, Spinner } from '@material-tailwind/react';
import { useEffect } from 'react';
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
		<div className="flex flex-col items-center justify-center h-screen">
			<Card className="mt-6 w-96">
				<CardHeader color="white" className="relative h-56 from-slate-300">
					<img src="https://www.pngarts.com/files/17/Game-Over-PNG-Image.png" alt="img-blur-shadow" className="w-full h-full object-cover" />
				</CardHeader>
				<CardBody>
					<Typography variant="h5" color="blue-gray" className="mb-2 text-center">
						SCORES
					</Typography>
					<Typography color="green" className="text-x1 text-center font-extrabold">
						{data.playedBy[1].username}: {data.score1} PTS
					</Typography>
					<Typography color="red" className="text-x1 text-center font-extrabold">
						{data.playedBy[0].username}: {data.score2} PTS
					</Typography>
				</CardBody>
				<CardFooter className="pt-0">
					<div className="flex flex-col items-center">
						<Button onClick={navigateTo}>Return to Dashboard</Button>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
