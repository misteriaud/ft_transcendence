import { useParams } from 'react-router-dom';
import { KeyedMutator } from 'swr';
import { Carousel, Spinner, Typography, Progress } from '@material-tailwind/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { useUser } from '../hooks/useUser';
import { e_match_state, i_user } from '../components/interfaces';
import { MatchHistory } from '../components/match-history';
import { User } from '../components/user';

function CarouselUserData({ user }: { user: i_user }) {
	const formattedDate = new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' });
	return (
		<div className="absolute inset-0 grid h-full w-full place-items-center bg-blue-500 ">
			<div>
				<div className="flex gap-8">
					<div className="rounded-full h-48 w-48 ">
						<User login42={user.login42} size="xxl" ignoreHoverStyle={true} className="h-full w-full object-cover" />
						{/* <img src={user.avatar} className="rounded-full h-full w-full object-cover" alt="user-img" /> */}
					</div>
					<div className="flex flex-col items-center justify-center w-60">
						<Typography variant="h4" className="mt-8 truncate max-w-full text-white">
							{user.username}
						</Typography>
						<Typography className="truncate max-w-full font-normal font-mono text-2xl text-white">{user.login42}</Typography>
						<Typography className="mt-4 italic truncate max-w-full font-normal font-mono text-xl text-gray-100">Member since:</Typography>
						<Typography className=" italic truncate max-w-full font-normal font-mono text-lg text-gray-100">{formattedDate}</Typography>
					</div>
				</div>
			</div>
		</div>
	);
}

function ProgressBar({ winrate }: { winrate: number }) {
	return (
		<div className="w-full p-4 flex-col items-center justify-center mt-6">
			<Typography variant="h4" className="text-center text-white">
				Win rate
			</Typography>
			<Progress value={winrate} size="md" color="green" className="bg-red-500 my-2" barProps={{ className: 'rounded-none' }} />
			<Typography variant="h4" className={`text-center ${winrate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
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
			if (match.state === e_match_state.FINISHED) {
				if ((user.id === match.playedBy[0].id && match.score1 > match.score2) || (user.id === match.playedBy[1].id && match.score2 > match.score1)) {
					++wins;
				} else {
					++loses;
				}
			}
		}
		return [wins, loses];
	}

	const [wins, loses] = returnStats(user);
	const winrate: number = wins !== 0 || loses !== 0 ? parseFloat(((wins * 100) / (wins + loses)).toFixed(0)) : 0;

	return (
		<div className="h-full w-full p-16 flex justify-center items-center bg-blue-500 ">
			<div className="flex-1 flex flex-col justify-center items-center">
				<Typography className="font-sans text-3xl font-bold text-green-400">WINS</Typography>
				<Typography className="font-sans text-4xl font-bold text-white">{wins}</Typography>
			</div>
			<div className="flex-1 flex flex-col justify-center items-center">
				<ProgressBar winrate={winrate} />
			</div>
			<div className="flex-1 flex flex-col justify-center items-center">
				<Typography className="font-sans text-3xl font-bold tracking-tighter text-red-400">LOSES</Typography>
				<Typography className="font-sans text-4xl font-bold text-white">{loses}</Typography>
			</div>
		</div>
	);
}

function ProfileCarousel({ user }: { user: i_user }) {
	return (
		<div className="h-64">
			<Carousel
				className="h-full mb-6 rounded-3xl"
				navigation={({ setActiveIndex, activeIndex, length }) => (
					<div className="absolute bottom-4 left-2/4 z-50 flex -translate-x-2/4 gap-2">
						{new Array(length).fill('').map((_, i) => (
							<span
								key={i}
								className={`block h-1 cursor-pointer rounded-2xl transition-all content-[''] ${activeIndex === i ? 'bg-white w-8' : 'bg-white/50 w-4'}`}
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
	const { login42 } = useParams();
	const {
		user,
		mutate: mutateUser,
		isLoading: isLoadingUser,
		error: errorUser
	}: { isLoading: boolean; user: i_user; mutate: KeyedMutator<i_user>; error: Error } = useUser(login42 || 'me');

	if (isLoadingUser) {
		return (
			<div className="flex justify-center items-center w-fit m-auto p-3 outline-none">
				<Spinner className="w-24 h-24" />
			</div>
		);
	}
	if (errorUser) {
		return (
			<div
				className="flex justify-center items-center w-fit m-auto p-3 rounded-3xl text-red-500 outline-none hover:text-red-900 hover:!bg-orange-100 hover:bg-opacity-80"
				onClick={() => {
					mutateUser();
				}}
			>
				<ExclamationTriangleIcon strokeWidth={2} className="h-24 w-24" />
			</div>
		);
	}
	return (
		<div className="flex flex-col px-8 justify-center items-center w-full h-fit">
			<div className="w-full h-fit m-4 p-4 rounded-3xl bg-white shadow-[0px_4px_6px_6px_rgba(0,0,0,0.1)]">
				<ProfileCarousel user={user} />
			</div>
			<div className="w-full h-fit m-4 p-4 rounded-3xl bg-white shadow-[0px_4px_6px_6px_rgba(0,0,0,0.1)]">
				<MatchHistory login42={user.login42} />
			</div>
		</div>
	);
}
