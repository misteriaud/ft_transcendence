import { Typography } from '@material-tailwind/react';
import { useNotificationContext } from '../useContext';

export function useNotifyNeutral() {
	const { notify } = useNotificationContext();

	return (message: string, timer?: number) => {
		notify({
			elem: <Typography className="font-normal">{message}</Typography>,
			color: 'blue',
			timer: timer
		});
	};
}
