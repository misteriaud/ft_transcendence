import React from 'react';
import { useParams } from 'react-router-dom';
import { Carousel, Spinner, Typography, Progress } from '@material-tailwind/react';
import { useMe, useUser } from '../hooks/useUser';
import { User } from '../components/user';
import { i_user } from '../components/interfaces';

function CarouselUserData({ user }: { user: i_user }) {
	const formattedDate = new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' });
	return (
		// <div className="bg-gradient-to-r from-deep-orange-200 to-amber-100 absolute inset-0 grid h-full w-full place-items-center">
		<div className="bg-gradient-to-r from-blue-gray-100 to-blue-gray-50 absolute inset-0 grid h-full w-full place-items-center">
			<div>
				<div className="flex gap-8">
					<div className="rounded-full bg-gray-800 h-48 w-48 border-4 border-gray-800">
						<img src={user.avatar} className="rounded-full h-full w-full object-cover" alt="user-img" />
					</div>
					<div className="flex flex-col items-center justify-center w-60">
						<Typography variant="h4" color="blue-gray" className="mt-8 truncate max-w-full">
							{user.username}
						</Typography>
						<Typography color="blue-gray" className="truncate max-w-full font-normal font-mono text-2xl">
							{user.login42}
						</Typography>
						<Typography color="gray" className="mt-4 italic truncate max-w-full font-normal font-mono text-xl">
							Member since:
						</Typography>
						<Typography color="gray" className=" italic truncate max-w-full font-normal font-mono text-lg">
							{formattedDate}
						</Typography>
					</div>
				</div>
			</div>
		</div>
	);
}

function ProgressBar({ winrate }: { winrate: number }) {
	return (
		<div className="w-full p-4 flex-col items-center justify-center mt-6">
			<Typography color="gray" variant="h6" className="text-center">
				win rate
			</Typography>
			<Progress value={winrate} variant="gradient" size="md" color="teal" className="bg-red-500" barProps={{ className: 'rounded-none' }} />
			<Typography color={winrate >= 50 ? 'teal' : 'red'} variant="h6" className="text-center">
				{winrate}%
			</Typography>
		</div>
	);
}

function CarouselStats({ user }: { user: i_user }) {
	function returnStats(user: i_user) {
		let wins = 0;
		let loses = 0;

		for (const match of user.history) {
			if ((user.id === match.playedBy[0].id && match.score1 > match.score2) || (user.id === match.playedBy[1].id && match.score2 > match.score1)) {
				++wins;
			} else {
				++loses;
			}
		}
		return [wins, loses];
	}

	const [wins, loses] = returnStats(user);
	const winrate: number = wins !== 0 || loses !== 0 ? parseFloat(((wins * 100) / (wins + loses)).toFixed(0)) : 0;

	return (
		// <div className="h-full w-full bg-gradient-to-l from-deep-orange-200 to-amber-100 p-16 flex justify-center items-center">
		<div className="h-full w-full bg-gradient-to-l from-blue-gray-100 to-blue-gray-50 p-16 flex justify-center items-center">
			<div className="flex-1 flex flex-col justify-center items-center">
				<Typography color="teal" className="font-sans text-3xl font-bold">
					WINS
				</Typography>
				<Typography className="font-sans text-4xl font-bold text-gray-700">{wins}</Typography>
			</div>
			<div className="flex-1 flex flex-col justify-center items-center">
				<ProgressBar winrate={winrate} />
			</div>
			<div className="flex-1 flex flex-col justify-center items-center">
				<Typography color="red" className="font-sans text-3xl font-bold tracking-tighter">
					LOSES
				</Typography>
				<Typography className="font-sans text-4xl font-bold text-gray-700">{loses}</Typography>
			</div>
		</div>
	);
}

function ProfileCarousel({ user }: { user: i_user }) {
	return (
		<div className="h-64 p-4">
			<Carousel
				className="h-full mb-6 rounded-3xl"
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
				<CarouselUserData user={user} />
				<CarouselStats user={user} />
			</Carousel>
		</div>
	);
}

export function ProfilePage() {
	const { username } = useParams();
	const { isLoading: isLoadingMe } = useMe();
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
				<ProfileCarousel user={user} />
				<div>
					<User room_id={1} login42={user.login42}></User>
				</div>
			</div>
		</div>
	);
}
