import { useParams } from 'react-router-dom';
import { KeyedMutator } from 'swr';
import { Avatar, Badge, Spinner, Typography } from '@material-tailwind/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { useUser } from '../hooks/useUser';
import { i_user } from '../components/interfaces';
import { MatchHistory } from '../components/match-history';

export function UserUIForProfile({ username, avatar }: { username: string; avatar: string | undefined }) {
	return (
		<div className="flex justify-start items-center p-2">
			<Badge className="w-5 h-5 border-2 border-gray-400" containerProps={{ className: 'min-w-fit' }} overlap="circular" placement="bottom-end" color="green">
				<Avatar className=" border-[3px] border-gray-400" variant="circular" alt={username} src={avatar} size="xxl" />
			</Badge>
			<Typography variant="h5" className="font-normal ml-3 text-ellipsis overflow-hidden">
				{'Nyan'}
			</Typography>
			<Typography variant="h5" className="font-normal ml-3 text-ellipsis overflow-hidden">
				{'spayeur'}
			</Typography>
			<Typography variant="h5" className="font-normal ml-3 text-ellipsis overflow-hidden">
				{'Since XX/XX/XXXX'}
			</Typography>
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
	}: { isLoading: boolean; user: i_user; mutate: KeyedMutator<i_user>; error: Error } = useUser(login42 || '');

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
		<div className="w-full h-fit m-12 p-4 rounded-3xl bg-white shadow-[0px_4px_6px_6px_rgba(0,0,0,0.1)]">
			<div className="flex justify-between mb-4">
				<UserUIForProfile username={user.username} avatar={user.avatar} />
				<Typography variant="h5" color="blue-gray" className="mb-2">
					TEST
				</Typography>
			</div>
			<div>
				<MatchHistory login42={user.login42} />
			</div>
		</div>
	);
}
