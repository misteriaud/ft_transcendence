import { Typography } from '@material-tailwind/react';
import { useNotificationContext } from '../useContext';

export function useNotifySuccess() {
	const { notify } = useNotificationContext();

	return (message?: string, timer?: number) => {
		notify({
			elem: <Typography className="font-normal">{message || 'Operation completed successfully.'}</Typography>,
			color: 'green',
			timer: timer
		});
	};
}
