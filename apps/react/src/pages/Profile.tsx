import { useParams } from 'react-router-dom';
import { Carousel, Spinner, Typography } from '@material-tailwind/react';
import { useMe, useUser } from '../hooks/useUser';
import { User } from '../components/user';
import defaultImg from '../images/pingpong-map.jpg';
import carouselBg from '../images/backgroundHomePage.jpg';
import { useState } from 'react';

function CarouselUserData() {
	return (
		<>
			<img src={carouselBg} alt="image 1" className="h-full w-full object-cover" />
			<div className="absolute inset-0 grid h-full w-full place-items-center">
				{/* <div className="bg-gray-300 absolute inset-0 grid h-full w-full place-items-center"> */}
				<div>
					<div className="flex gap-8">
						<div className="rounded-full h-48 w-48 border-4 border-gray-800">
							<img src={defaultImg} className="rounded-full h-full w-full object-cover" alt="user-img" />
						</div>
						<div className="flex flex-col items-center justify-center w-60">
							<Typography variant="h4" color="blue-gray" className="mt-8 truncate max-w-full">
								Unlongblazzzeee
							</Typography>
							<Typography color="blue-gray" className="truncate max-w-full font-normal font-mono text-2xl">
								jvermeer
							</Typography>
							<Typography color="gray" className="mt-4 italic truncate max-w-full font-normal font-mono text-xl">
								member since:
							</Typography>
							<Typography color="gray" className=" italic truncate max-w-full font-normal font-mono text-lg">
								08/06/2023
							</Typography>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

function CarouselStats() {
	const [wins, setWins] = useState(5);
	const [loses, setLoses] = useState(19);
	const winrate = (wins / loses).toFixed(2);
	return (
		<div className="h-full w-full bg-cover bg-center p-16 flex justify-center items-center" style={{ backgroundImage: `url(${carouselBg})` }}>
			<div className="flex-1 flex flex-col justify-center items-center">
				<Typography variant="h2" color="green">
					Wins
				</Typography>
				<Typography variant="h1" color="black">
					{wins}
				</Typography>
			</div>
			<div className="flex-1 flex flex-col justify-center items-center">
				<Typography variant="h4" color="gray">
					win rate:
				</Typography>
				<Typography variant="h4" color="blue-gray">
					{winrate}
				</Typography>
			</div>
			<div className="flex-1 flex flex-col justify-center items-center">
				<Typography variant="h2" color="red">
					Loses
				</Typography>
				<Typography variant="h1" color="black">
					{loses}
				</Typography>
			</div>
		</div>
	);
}

function ProfileCarousel() {
	return (
		<div className="h-screen p-4 mb-30">
			<Carousel
				className="h-64 mb-6 rounded-3xl"
				navigation={({ setActiveIndex, activeIndex, length }) => (
					<div className="absolute bottom-4 left-2/4 z-50 flex -translate-x-2/4 gap-2">
						{new Array(length).fill('').map((_, i) => (
							<span
								key={i}
								className={`block h-1 cursor-pointer rounded-2xl transition-all content-[''] ${activeIndex === i ? 'bg-gray-900 w-8' : 'bg-gray-900/50 w-4'}`}
								onClick={() => setActiveIndex(i)}
							/>
						))}
					</div>
				)}
			>
				<CarouselUserData />
				<CarouselStats />
			</Carousel>
		</div>
	);
}

export function ProfilePage() {
	const { username } = useParams();
	const { isLoading: isLoadingMe /*, me*/ } = useMe();
	const { isLoading: isLoadingUser, user } = useUser(username || '');

	if (isLoadingMe || isLoadingUser) {
		return <Spinner />;
	}
	if (!user) {
		return <h2>User not Found</h2>;
	}
	return (
		<div className="h-screen bg-gray-200">
			<div className="flex flex-col">
				{/* <ProfileCarousel /> */}
				<div>
					<User room_id={1} login42={user.login42}></User>
				</div>
			</div>
		</div>
	);
}
