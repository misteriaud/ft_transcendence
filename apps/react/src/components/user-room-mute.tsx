import { useEffect, useState } from 'react';
import { Button, Dialog, DialogBody, DialogFooter, DialogHeader, Option, Select, Spinner, Typography } from '@material-tailwind/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { KeyedMutator } from 'swr';
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
	const time = {
		_5m: 5 * 60 * 1000,
		_30m: 30 * 60 * 1000,
		_1h: 1 * 60 * 60 * 1000,
		_6h: 6 * 60 * 60 * 1000,
		_12h: 12 * 60 * 60 * 1000,
		_1d: 1 * 24 * 60 * 60 * 1000,
		_7d: 7 * 24 * 60 * 60 * 1000,
		_14d: 14 * 24 * 60 * 60 * 1000,
		_30d: 30 * 24 * 60 * 60 * 1000,
		_90d: 90 * 24 * 60 * 60 * 1000,
		_180d: 180 * 24 * 60 * 60 * 1000,
		_365d: 365 * 24 * 60 * 60 * 1000,
		_infinity: 70372022400000
	};
	const [muteFor, setMuteFor] = useState(time._5m);
	const [muteUntil, setMuteUntil] = useState(new Date(Date.now() + time._5m));
	const notifySuccess = useNotifySuccess();
	const notifyError = useNotifyError();
	const api = useApi();

	useEffect(() => {
		if (isLoadingRoom || errorRoom) {
			return;
		}
		const interval = setInterval(() => {
			if (muteFor !== time._infinity) {
				setMuteUntil(new Date(Date.now() + muteFor));
			}
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	}, [muteFor]);

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
		if (typeof value === 'undefined' || value === '5m') {
			setMuteFor(time._5m);
			setMuteUntil(new Date(Date.now() + time._5m));
		} else if (value === '30m') {
			setMuteFor(time._30m);
			setMuteUntil(new Date(Date.now() + time._30m));
		} else if (value === '1h') {
			setMuteFor(time._1h);
			setMuteUntil(new Date(Date.now() + time._1h));
		} else if (value === '6h') {
			setMuteFor(time._6h);
			setMuteUntil(new Date(Date.now() + time._6h));
		} else if (value === '12h') {
			setMuteFor(time._12h);
			setMuteUntil(new Date(Date.now() + time._12h));
		} else if (value === '1d') {
			setMuteFor(time._1d);
			setMuteUntil(new Date(Date.now() + time._1d));
		} else if (value === '7d') {
			setMuteFor(time._7d);
			setMuteUntil(new Date(Date.now() + time._7d));
		} else if (value === '14d') {
			setMuteFor(time._14d);
			setMuteUntil(new Date(Date.now() + time._14d));
		} else if (value === '30d') {
			setMuteFor(time._30d);
			setMuteUntil(new Date(Date.now() + time._30d));
		} else if (value === '90d') {
			setMuteFor(time._90d);
			setMuteUntil(new Date(Date.now() + time._90d));
		} else if (value === '180d') {
			setMuteFor(time._180d);
			setMuteUntil(new Date(Date.now() + time._180d));
		} else if (value === '365d') {
			setMuteFor(time._365d);
			setMuteUntil(new Date(Date.now() + time._365d));
		} else if (value === 'Infinity') {
			setMuteFor(time._infinity);
			setMuteUntil(new Date(time._infinity));
		}
	}

	function handleCancel() {
		setMuteFor(time._5m);
		setMuteUntil(new Date(Date.now() + time._5m));
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
						<Option value="30m">30 minutes</Option>
						<Option value="1h">1 hour</Option>
						<Option value="6h">6 hours</Option>
						<Option value="12h">12 hours</Option>
						<Option value="1d">1 day</Option>
						<Option value="7d">7 days</Option>
						<Option value="14d">14 days</Option>
						<Option value="30d">30 days</Option>
						<Option value="90d">90 days</Option>
						<Option value="180d">180 days</Option>
						<Option value="365d">365 days</Option>
						<Option value="Infinity">Forever</Option>
					</Select>
				</div>
				<div>
					{muteFor === time._infinity ? (
						<Typography className="text-center" variant="h6">
							<span className="text-blue-500">{user.username}</span> will be muted <span className="text-red-500">forever</span>.
						</Typography>
					) : (
						<Typography className="text-center" variant="h6">
							<span className="text-blue-500">{user.username}</span> will be muted until{' '}
							<span className="text-red-500">
								{muteUntil.toLocaleTimeString('en-US', {
									month: '2-digit',
									day: '2-digit',
									year: 'numeric',
									hour: '2-digit',
									minute: '2-digit',
									second: '2-digit'
								})}
							</span>
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
