import { Avatar, Badge, Typography } from '@material-tailwind/react';
import { forwardRef } from 'react';

export const UserUI = forwardRef(function UserUI(
	{
		username,
		avatar,
		inverse,
		onClick: onClickHandler
	}: { username: string; avatar: string | undefined; inverse?: boolean; onClick?: React.MouseEventHandler<HTMLDivElement> },
	ref: any
) {
	return (
		<div
			ref={ref}
			className="flex justify-center items-center p-3 rounded-md text-blue-gray-500 hover:text-blue-gray-900 bg-white hover:bg-blue-gray-50 hover:bg-opacity-80"
			onClick={onClickHandler}
		>
			{inverse && (
				<Typography variant="h5" className="font-normal mr-3">
					{username}
				</Typography>
			)}
			<Badge overlap="circular" placement="bottom-end" color="green">
				<Avatar variant="circular" alt={username} className="cursor-pointer" src={`${avatar}?t=${Date.now()}`} />
			</Badge>
			{!inverse && (
				<Typography variant="h5" className="font-normal ml-3">
					{username}
				</Typography>
			)}
		</div>
	);
});
