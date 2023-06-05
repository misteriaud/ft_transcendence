import { Avatar, Badge, Typography } from '@material-tailwind/react';
import { color } from '@material-tailwind/react/types/components/badge';
import { forwardRef } from 'react';
import { e_user_status } from './interfaces';

export const UserUI = forwardRef((props: any, ref: any) => {
	const {
		username,
		avatar,
		status,
		inverse = false,
		className,
		...otherProps
	}: { username: string; avatar: string | undefined; status: e_user_status; inverse?: boolean; className: string; otherProps: any } = props;

	let color: color | undefined;

	switch (status) {
		case e_user_status.ONLINE:
			color = 'green';
			break;

		case e_user_status.OFFLINE:
			color = 'red';
			break;

		case e_user_status.INGAME:
			color = 'orange';
			break;
	}

	return (
		<div ref={ref} className={`flex ${inverse ? 'flex-row-reverse' : ''} justify-start items-center ${className} gap-2`} {...otherProps}>
			<Badge containerProps={{ className: 'min-w-fit' }} overlap="circular" placement="bottom-end" color={color}>
				<Avatar variant="circular" alt={username} src={`${avatar}?t=${Date.now()}`} size="sm" />
			</Badge>
			<p className="text-sm p-2">{username}</p>
		</div>
	);
});
