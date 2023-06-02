import { useState } from 'react';
import { Avatar, Button, Dialog, DialogBody, DialogFooter, DialogHeader, Input, Spinner, Switch, Typography } from '@material-tailwind/react';
import { ExclamationTriangleIcon, PencilIcon } from '@heroicons/react/24/solid';
import QRCode from 'react-qr-code';
import { useStoreDispatchContext } from '../hooks/useContext';
import { StoreActionType } from '../context/storeProvider';
import { useApi } from '../hooks/useApi';
import './me-settings.css';
import { useMe } from '../hooks/useUser';

export function SettingsDialog({ dialogStatus, dialogHandler }: any) {
	const { me, mutate } = useMe();
	const [state, setState] = useState('initial');
	const [info, setInfo] = useState({
		username: me.username,
		avatar: null,
		avatarURL: me.avatar,
		twoFactorEnabled: me.twoFactorEnabled,
		twoFactorSecret: ''
	});
	const dispatch = useStoreDispatchContext();
	const api = useApi();
	console.log(state);

	function handleAvatarUpload(event: any) {
		const avatar = event.target.files[0];
		setState('editing');
		setInfo({ ...info, avatar: avatar, avatarURL: URL.createObjectURL(avatar) });
	}

	function handleUsernameChange(event: any) {
		setState('editing');
		setInfo({ ...info, username: event.target.value });
	}

	function handleTwoFactorEnabledChange(event: any) {
		setState('editing');

		setInfo({ ...info, twoFactorEnabled: event.target.checked });
	}

	function handleCancel() {
		setState('initial');
		setInfo({ ...info, username: me.username, avatarURL: me.avatar, twoFactorEnabled: me.twoFactorEnabled, twoFactorSecret: '' });
		dialogHandler();
	}

	async function handleSave() {
		const formData = new FormData();

		if (me.avatar !== info.avatarURL) {
			typeof info.avatar !== 'undefined' && info.avatar !== null && formData.append('avatar', info.avatar);
		}
		if (me.username !== info.username) {
			typeof info.username !== 'undefined' && info.username !== null && formData.append('username', info.username);
		}
		if (me.twoFactorEnabled !== info.twoFactorEnabled) {
			typeof info.twoFactorEnabled !== 'undefined' && info.twoFactorEnabled !== null && formData.append('twoFactorEnabled', info.twoFactorEnabled);
		}

		setState('loading');
		await api
			.put('/users/me', formData, {
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			})
			.then((res) => {
				const username = res.data.username;
				const avatarURL = `${res.data.avatar}?t=${Date.now()}`;
				const twoFactorEnabled = res.data.twoFactorEnabled;

				mutate({
					...me,
					username: username,
					avatar: avatarURL,
					twoFactorEnabled: twoFactorEnabled
				});
				if (res.data.twoFactorSecret) {
					setState('two-factor-secret');
					setInfo({ ...info, username: username, avatarURL: avatarURL, twoFactorEnabled: twoFactorEnabled, twoFactorSecret: res.data.twoFactorSecret });
				} else {
					setState('initial');
					setInfo({ ...info, username: username, avatarURL: avatarURL, twoFactorEnabled: twoFactorEnabled, twoFactorSecret: '' });
					dialogHandler();
				}
			})
			.catch(() => {
				setState('editing');
			});
	}

	const editing = (
		<>
			<DialogBody className="flex justify-around p-8" divider>
				<div className="relative">
					<Avatar
						variant="circular"
						size="xxl"
						alt={me.login42}
						className="avatar cursor-pointer transition-brightness duration-300 hover:brightness-75"
						src={info.avatarURL}
						onClick={() => document.getElementById('avatar-upload')?.click()}
					/>
					<PencilIcon
						strokeWidth={2}
						className="pencil-icon h-8 w-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
					/>
					<input id="avatar-upload" className="hidden" type="file" accept="image/*" onChange={handleAvatarUpload} />
				</div>
				<div className="flex flex-col justify-around">
					<Input variant="static" label="Username" value={info.username} onChange={handleUsernameChange} />
					<Switch
						id="two-factor-authentication"
						label="Enable two-factor authentication"
						checked={info.twoFactorEnabled}
						onChange={handleTwoFactorEnabledChange}
					/>
				</div>
			</DialogBody>
			<DialogFooter className="justify-center">
				<Button variant="text" color="red" onClick={handleCancel} className="mr-1">
					<span>Cancel</span>
				</Button>
				<Button variant="gradient" color="green" onClick={handleSave}>
					<span>Save</span>
				</Button>
			</DialogFooter>
		</>
	);

	const loading = (
		<DialogBody className="flex justify-around p-8" divider>
			<Spinner className="h-24 w-24" />
		</DialogBody>
	);

	const twoFactorSecret = (
		<>
			<DialogBody className="flex flex-col justify-around items-center p-8" divider>
				<Typography className="text-center" variant="h1" color="blue">
					{info.twoFactorSecret}
				</Typography>
				<QRCode className="mt-4 mb-4" value={`otpauth://totp/ft_transcendence?secret=${info.twoFactorSecret}&algorithm=SHA1&digits=6&period=30`} />
				<div className="flex items-center">
					<ExclamationTriangleIcon strokeWidth={2} className="h-16 w-16 text-red-500" />
					<Typography className="text-center" variant="h6" color="red">
						This code is essential for your account's security. Once this popup is closed, it will no longer be visible, and you won't be able to access your
						account without it.
					</Typography>
				</div>
			</DialogBody>
			<DialogFooter className="justify-center">
				<Button variant="text" color="red" onClick={handleCancel} className="mr-1">
					<span>Close</span>
				</Button>
			</DialogFooter>
		</>
	);

	return (
		<Dialog
			className="settings-dialog"
			open={dialogStatus}
			handler={handleCancel}
			dismiss={{ enabled: state !== 'loading' && state !== 'two-factor-secret' }}
			animate={{
				mount: { scale: 1, y: 0 },
				unmount: { scale: 0.9, y: -100 }
			}}
		>
			<DialogHeader className="justify-center">Settings</DialogHeader>
			{(state === 'initial' || state === 'editing') && editing}
			{state === 'loading' && loading}
			{state === 'two-factor-secret' && twoFactorSecret}
		</Dialog>
	);
}
