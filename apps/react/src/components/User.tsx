import { useUser } from '../hooks/useUser';
import { Avatar, Chip, Spinner, Typography, Badge } from '@material-tailwind/react';

export function User({ userId }: { userId: number }) {
	const { isLoading, forbiden, user } = useUser(userId);

	if (isLoading) return <Chip icon={<Spinner />} value="..." />;
	if (forbiden) return <Chip icon={<Spinner />} value="forbiden" />;

	return (
		// <Chip
		// 	icon={
		// 		<Avatar
		// 			variant="circular"
		// 			alt="candice wu"
		// 			src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1480&q=80"
		// 		/>
		// 	}
		// 	value={
		// 		<Typography variant="small" color="white" className="font-medium leading-none">
		// 			{user.name}
		// 		</Typography>
		// 	}
		// 	color="teal"
		// 	className="rounded-full py-1.5"
		// />
		<div className="flex items-center gap-2">
			<Badge color="red">
				<Avatar
					variant="rounded"
					size="xs"
					alt={user.username}
					src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1480&q=80"
				/>
			</Badge>
			<div className="flex flex-col gap-1">
				<Typography variant="small" color="gray" className="font-normal">
					{user.username}
				</Typography>
			</div>
		</div>
	);
}
