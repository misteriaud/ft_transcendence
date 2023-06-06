import { Avatar, Badge, Typography } from '@material-tailwind/react';
import { forwardRef } from 'react';

export const UserUI = forwardRef((props: any, ref: any) => {
	const {
		username,
		avatar,
		inverse,
		className,
		...otherProps
	}: { username: string; avatar: string | undefined; inverse?: boolean; className: string; otherProps: any } = props;

	return (
		<div ref={ref} className={`flex ${!inverse ? 'justify-start' : 'justify-end'} items-center p-2 ${className}`} {...otherProps}>
			{inverse && (
				<Typography variant="h5" className="font-normal mr-3">
					{username}
				</Typography>
			)}
			<Badge containerProps={{ className: 'min-w-fit' }} overlap="circular" placement="bottom-end" color="green">
				<Avatar variant="circular" alt={username} src={avatar} />
			</Badge>
			{!inverse && (
				<Typography variant="h5" className="font-normal ml-3 text-ellipsis overflow-hidden">
					{username}
				</Typography>
			)}
		</div>
	);
});
