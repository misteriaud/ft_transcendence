import { useEffect, useState } from 'react';
import { Button, Dialog, DialogBody, DialogFooter, DialogHeader, Option, Select, Spinner, Typography } from '@material-tailwind/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { KeyedMutator } from 'swr';
import moment, { DurationInputArg1, DurationInputArg2 } from 'moment';
import Moment from 'react-moment';
import { i_room } from './interfaces';
import { useRoom } from '../hooks/useRoom';
import { useApi } from '../hooks/useApi';
import { useNotifyError, useNotifySuccess } from '../hooks/notifications';

export function MuteDialog({ user, room_id, dialogStatus, dialogHandler }: any) {
	const {
		room,
		mutate: mutateRoom,
		isLoading: isLoadingRoom,
		error: errorRoom
	}: { isLoading: boolean; room: i_room; mutate: KeyedMutator<i_room>; error: Error } = useRoom(room_id);
	const [muteFor, setMuteFor] = useState('5m');
	const [muteUntil, setMuteUntil] = useState(moment().add(5, 'm').toDate());
	const notifySuccess = useNotifySuccess();
	const notifyError = useNotifyError();
	const api = useApi();

	useEffect(() => {
		if (!dialogStatus || isLoadingRoom || errorRoom) {
			return;
		}
		const interval = setInterval(() => {
			handleMuteDialogSelect(muteFor);
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	}, [dialogStatus, isLoadingRoom, errorRoom, muteFor]);

	if (isLoadingRoom) {
		return (
			<>
				<Dialog open={dialogStatus} handler={dialogHandler}>
					<DialogHeader className="justify-center">Mute</DialogHeader>
					<DialogBody className="flex justify-around  items-center p-8" divider>
						<Spinner className="h-16 w-16" />
					</DialogBody>
				</Dialog>
			</>
		);
	}
	if (errorRoom) {
		return (
			<>
				<Dialog open={dialogStatus} handler={dialogHandler}>
					<DialogHeader className="justify-center">Mute</DialogHeader>
					<DialogBody className="flex justify-around  items-center p-8" divider>
						<div
							className="flex justify-around w-full rounded-md text-red-500 outline-none hover:text-red-900 bg-white hover:!bg-red-50 hover:bg-opacity-80"
							onClick={() => mutateRoom()}
						>
							<ExclamationTriangleIcon strokeWidth={2} className="h-16 w-16 text-red-500" />
						</div>
					</DialogBody>
				</Dialog>
			</>
		);
	}

	function handleMuteDialogSelect(value: string | undefined) {
		if (typeof value === 'undefined') {
			value = '5m';
		}
		setMuteFor(value);
		if (value !== 'Infinity') {
			const val = value.slice(0, -1) as DurationInputArg1;
			const unit = value.slice(-1) as DurationInputArg2;

			setMuteUntil(moment().add(val, unit).toDate());
		} else {
			setMuteUntil(new Date(70372022400000));
		}
	}

	function handleCancel() {
		setMuteFor('5m');
		setMuteUntil(moment().add(5, 'm').toDate());
		dialogHandler();
	}

	async function handleSave() {
		await api
			.put(`/rooms/${room.id}/mute/${user.id}`, { mute_until: muteUntil })
			.then(() => {
				mutateRoom();
				notifySuccess(`${user.username} has been muted.`);
				dialogHandler();
			})
			.catch(() => {
				notifyError();
			});
	}

	return (
		<Dialog
			open={dialogStatus}
			handler={dialogHandler}
			animate={{
				mount: { scale: 1, y: 0 },
				unmount: { scale: 0.9, y: -100 }
			}}
		>
			<DialogHeader className="justify-center text-center">Mute</DialogHeader>
			<DialogBody className="flex justify-around items-center flex-wrap p-8 gap-4" divider>
				<div>
					<Select label="Mute for" value="5m" onChange={handleMuteDialogSelect}>
						<Option value="5m">5 minutes</Option>
						<Option value="15m">15 minutes</Option>
						<Option value="30m">30 minutes</Option>
						<Option value="45m">45 minutes</Option>
						<Option value="1h">1 hour</Option>
						<Option value="3h">3 hours</Option>
						<Option value="6h">6 hours</Option>
						<Option value="12h">12 hours</Option>
						<Option value="1d">1 day</Option>
						<Option value="3d">3 days</Option>
						<Option value="1w">1 week</Option>
						<Option value="2w">2 weeks</Option>
						<Option value="3w">3 weeks</Option>
						<Option value="1M">1 month</Option>
						<Option value="3M">3 months</Option>
						<Option value="6M">6 months</Option>
						<Option value="9M">9 months</Option>
						<Option value="1y">1 year</Option>
						<Option value="2y">2 years</Option>
						<Option value="3y">3 years</Option>
						<Option value="5y">5 years</Option>
						<Option value="10y">10 years</Option>
						<Option value="20y">20 years</Option>
						<Option value="Infinity">Forever</Option>
					</Select>
				</div>
				<div>
					{muteFor === 'Infinity' ? (
						<Typography className="text-center" variant="h6">
							<span className="text-blue-500">{user.username}</span> will be muted <span className="text-red-500">forever</span>.
						</Typography>
					) : (
						<Typography className="text-center" variant="h6">
							<span className="text-blue-500">{user.username}</span> will be muted until{' '}
							<Moment className="text-red-500" format="MM/DD/YYYY hh:mm:ss A">
								{muteUntil}
							</Moment>
							.
						</Typography>
					)}
				</div>
			</DialogBody>
			<DialogFooter className="justify-center">
				<Button variant="text" color="red" onClick={handleCancel} className="mr-1">
					<span>Cancel</span>
				</Button>
				<Button variant="gradient" color="green" onClick={handleSave}>
					<span>Confirm</span>
				</Button>
			</DialogFooter>
		</Dialog>
	);
}
