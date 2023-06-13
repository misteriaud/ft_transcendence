import { Avatar, Badge, Tooltip, Typography } from '@material-tailwind/react';
import { size } from '@material-tailwind/react/types/components/avatar';
import { color } from '@material-tailwind/react/types/components/badge';
import { forwardRef } from 'react';
import { e_user_status } from './interfaces';

export const UserUI = forwardRef((props: any, ref: any) => {
	const {
		username,
		avatar,
		inverse = false,
		ignoreHoverStyle,
		className,
		status,
		size,
		...otherProps
	}: {
		username: string;
		avatar: string | undefined;
		inverse?: boolean;
		ignoreHoverStyle?: boolean;
		className?: string;
		status: e_user_status;
		size?: size;
		otherProps: any;
	} = props;

	let color: color | undefined;

	switch (status) {
		case e_user_status.OFFLINE:
			color = 'red';
			break;

		case e_user_status.ONLINE:
			color = 'green';
			break;

		case e_user_status.INGAME:
			color = 'orange';
			break;

		case e_user_status.INGAME:
			color = 'indigo';
			break;
	}

	return (
		<div
			ref={ref}
			className={`shrink-0 flex ${inverse ? 'flex-row-reverse' : ''} justify-start items-center ${className} gap-2 rounded-md text-blue-gray-700 ${
				!ignoreHoverStyle && 'hover:text-blue-gray-900 hover:bg-blue-gray-50 hover:bg-opacity-80 cursor-pointer'
			}`}
			{...otherProps}
		>
			<Badge overlap="circular" placement="bottom-end" color={color}>
				<Avatar variant="circular" alt={username} src={`${avatar}?t=${Date.now()}`} size={size} className={size === 'xxl' ? 'h-48 w-48' : ''} />
			</Badge>
			{size !== 'xs' && size !== 'xxl' && <p className="text-sm p-2 truncate">{username}</p>}
		</div>
	);
});
