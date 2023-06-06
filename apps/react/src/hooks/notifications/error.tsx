import { Typography } from '@material-tailwind/react';
import { useNotificationContext } from '../useContext';

export function useNotifyError() {
	const { notify } = useNotificationContext();

	return (message?: string, timer?: number) => {
		notify({
			elem: <Typography className="font-normal">{message || 'An error occurred. Please try again later.'}</Typography>,
			color: 'red',
			timer: timer
		});
	};
}
