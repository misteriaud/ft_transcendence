import { KeyedMutator } from 'swr';
import Moment from 'react-moment';
import { Chip, Spinner, Typography } from '@material-tailwind/react';
import { BoltIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { useMe, useUser } from '../hooks/useUser';
import { e_match_mod, e_match_state, i_me, i_user } from '../components/interfaces';
import { User } from '../components/user';

function MatchHistoryTableHead() {
	const TABLE_HEAD = ['Players', 'Result', 'Score', 'Mod', 'Date'];

	return (
		<thead>
			<tr>
				{TABLE_HEAD.map((head) => (
					<th key={head} className="p-4 border-y border-blue-gray-100 bg-blue-gray-50/50">
						<Typography variant="small" color="blue-gray" className="font-normal leading-none text-center">
							{head}
						</Typography>
					</th>
				))}
			</tr>
		</thead>
	);
}

function MatchHistoryTableBody({ login42 }: { login42: string }) {
	const { me, mutate: mutateMe, isLoading: isLoadingMe, error: errorMe }: { isLoading: boolean; me: i_me; mutate: KeyedMutator<i_me>; error: Error } = useMe();
	const {
		user,
		mutate: mutateUser,
		isLoading: isLoadingUser,
		error: errorUser
	}: { isLoading: boolean; user: i_user; mutate: KeyedMutator<i_user>; error: Error } = useUser(login42 || '');

	if (isLoadingMe || isLoadingUser) {
		return (
			<tbody>
				<tr>
					<td colSpan={5}>
						<div className="flex justify-center items-center p-8">
							<Spinner className="h-12 w-12" />
						</div>
					</td>
				</tr>
			</tbody>
		);
	}
	if (errorMe || errorUser) {
		return (
			<tbody>
				<tr>
					<td colSpan={5}>
						<div
							className="flex justify-center items-center p-8 text-red-500 outline-none hover:text-red-900 bg-white hover:!bg-red-50 hover:bg-opacity-80"
							onClick={() => {
								mutateMe();
								mutateUser();
							}}
						>
							<ExclamationTriangleIcon strokeWidth={2} className="h-12 w-12" />
						</div>
					</td>
				</tr>
			</tbody>
		);
	}

	const rows = [];

	for (let i = user.history.length - 1; i >= 0; i--) {
		const m = user.history[i];

		rows.push(
			<tr key={m.id} className="border-b-2 border-blue-gray-50">
				<td className="p-2">
					<div className="flex justify-around items-center gap-2">
						<User
							className="flex justify-center flex-1 max-w-md mr-auto"
							login42={m.playedBy[0].login42}
							inverse={false}
							ignoreHoverStyle={me.id === m.playedBy[0].id}
						/>
						<BoltIcon strokeWidth={2} className="h-6 w-6  text-blue-gray-500" />
						<User
							className="flex justify-center flex-1 max-w-md ml-auto"
							login42={m.playedBy[1].login42}
							inverse={true}
							ignoreHoverStyle={me.id === m.playedBy[1].id}
						/>
					</div>
				</td>
				<td className="p-2">
					<div className="flex justify-around items-center gap-2">
						<Chip
							className="w-fit"
							size="sm"
							variant="ghost"
							value={
								m.state === e_match_state.ABANDONNED
									? 'Interrupted'
									: (user.id === m.playedBy[0].id && m.score1 >= 11) || (user.id === m.playedBy[1].id && m.score2 >= 11)
									? 'Win'
									: 'Lose'
							}
							color={
								m.state === e_match_state.ABANDONNED
									? 'amber'
									: (user.id === m.playedBy[0].id && m.score1 >= 11) || (user.id === m.playedBy[1].id && m.score2 >= 11)
									? 'green'
									: 'red'
							}
						/>
					</div>
				</td>
				<td className="p-2">
					<div className="flex justify-around items-center gap-2">
						<Typography variant="small" color="blue-gray" className="font-normal">
							{`${m.score1} - ${m.score2}`}
						</Typography>
					</div>
				</td>
				<td className="p-2">
					<div className="flex justify-around items-center gap-2">
						<Chip className="w-fit" size="sm" variant="ghost" value={m.mod} color={m.mod === e_match_mod.NORMAL ? 'gray' : 'purple'} />
					</div>
				</td>
				<td className="p-2">
					<div className="flex justify-around items-center gap-2">
						<Moment fromNow>{m.createdAt}</Moment>
					</div>
				</td>
			</tr>
		);
	}

	return <tbody>{rows}</tbody>;
}

export function MatchHistory({ login42 }: { login42: string }) {
	return (
		<div className="w-full rounded-3xl border border-blue-gray-100 bg-blue-500">
			<Typography className="text-center p-4 text-white" variant="h4" color="blue-gray">
				Match History
			</Typography>
			<table className="w-full text-blue-gray-700 bg-white">
				<MatchHistoryTableHead />
				<MatchHistoryTableBody login42={login42} />
			</table>
		</div>
	);
}
