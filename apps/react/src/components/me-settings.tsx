import { useState } from 'react';
import {
	Avatar,
	Button,
	Collapse,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
	Input,
	List,
	ListItem,
	ListItemPrefix,
	ListItemSuffix,
	Spinner,
	Switch,
	Tab,
	TabPanel,
	Tabs,
	TabsBody,
	TabsHeader,
	Typography
} from '@material-tailwind/react';
import {
	ArrowPathIcon,
	ChevronDownIcon,
	ClipboardDocumentListIcon,
	CubeTransparentIcon,
	ExclamationTriangleIcon,
	HashtagIcon,
	PencilIcon,
	VariableIcon
} from '@heroicons/react/24/solid';
import QRCode from 'react-qr-code';
import { useApi } from '../hooks/useApi';
import './me-settings.css';
import { useMe } from '../hooks/useUser';

export function SettingsDialog({ dialogStatus, dialogHandler }: any) {
	const { me, mutate } = useMe();
	const [state, setState] = useState('initial');
	const [activeTab, setActiveTab] = useState('qr-code');
	const [collapse, setCollapse] = useState(false);
	const [info, setInfo] = useState({
		username: me.username,
		avatar: null,
		avatarURL: me.avatar,
		twoFactorEnabled: me.twoFactorEnabled,
		twoFactorSecret: ''
	});
	const api = useApi();

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
		setInfo({ ...info, username: me.username, avatar: null, avatarURL: me.avatar, twoFactorEnabled: me.twoFactorEnabled, twoFactorSecret: '' });
		setActiveTab('qr-code');
		setCollapse(false);
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
					setActiveTab('qr-code');
					setCollapse(false);
					dialogHandler();
				}
			})
			.catch(() => {
				setState('editing');
			});
	}

	const editing = (
		<>
			<DialogHeader className="justify-center">Settings</DialogHeader>
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
		<>
			<DialogHeader className="justify-center">Settings</DialogHeader>
			<DialogBody className="flex justify-around p-8" divider>
				<Spinner className="h-24 w-24" />
			</DialogBody>
		</>
	);

	const twoFactorSecret = (
		<>
			<DialogHeader className="justify-center">Two-factor authentication (2FA)</DialogHeader>
			<DialogBody className="flex flex-col justify-around items-center p-8" divider>
				<Tabs value={activeTab}>
					<TabsHeader
						className="rounded-none border-b border-blue-gray-50 bg-transparent p-0"
						indicatorProps={{
							className: 'bg-transparent border-b-2 border-blue-500 shadow-none rounded-none'
						}}
					>
						<Tab key="setup-key" value="setup-key" onClick={() => setActiveTab('setup-key')} className={activeTab === 'setup-key' ? 'text-blue-500' : ''}>
							Setup Key
						</Tab>
						<Tab key="qr-code" value="qr-code" onClick={() => setActiveTab('qr-code')} className={activeTab === 'qr-code' ? 'text-blue-500' : ''}>
							QR Code
						</Tab>
					</TabsHeader>
					<TabsBody>
						<TabPanel key={'setup-key'} value={'setup-key'}>
							<Typography className="text-center mb-4">
								You can configure two-factor authentication (2FA) using a mobile app. You can add a token manually with the following secret:
							</Typography>
							<Button
								className="flex justify-center items-center mb-1 mx-auto"
								variant="text"
								onClick={() => {
									navigator.clipboard.writeText(info.twoFactorSecret);
								}}
							>
								<Typography variant="h3" color="blue" textGradient>
									{info.twoFactorSecret}
								</Typography>
								<ClipboardDocumentListIcon className="h-5 w-5 m-2 text-blue-gray-500" />
							</Button>
							<div className="flex">
								<Button className="flex mx-auto items-center" variant="text" color="blue-gray" onClick={() => setCollapse(!collapse)}>
									<Typography className="text-xl normal-case">Additional Information</Typography>
									<ChevronDownIcon strokeWidth={2.5} className={`h-5 w-5 ml-2 transition-transform ${collapse ? 'rotate-180' : ''}`} />
								</Button>
							</div>
							<Collapse className="flex" open={collapse}>
								<List className="mx-auto px-8">
									<ListItem ripple={false} className="p-1 pointer-events-none">
										<ListItemPrefix className="mr-2">
											<CubeTransparentIcon className="h-5 w-5 my-2 text-blue-gray-500" />
										</ListItemPrefix>
										<Typography>Type:</Typography>
										<ListItemSuffix className="inline-flex pl-4">
											<Typography>TOTP</Typography>
										</ListItemSuffix>
									</ListItem>
									<ListItem ripple={false} className="p-1 pointer-events-none">
										<ListItemPrefix className="mr-2">
											<HashtagIcon className="h-5 w-5 my-2 text-blue-gray-500" />
										</ListItemPrefix>
										<Typography>Digits:</Typography>
										<ListItemSuffix className="inline-flex pl-4">
											<Typography>6</Typography>
										</ListItemSuffix>
									</ListItem>
									<ListItem ripple={false} className="p-1 pointer-events-none">
										<ListItemPrefix className="mr-2">
											<ArrowPathIcon className="h-5 w-5 my-2 text-blue-gray-500" />
										</ListItemPrefix>
										<Typography>Interval:</Typography>
										<ListItemSuffix className="inline-flex pl-4">
											<Typography>30</Typography>
										</ListItemSuffix>
									</ListItem>
									<ListItem ripple={false} className="p-1 pointer-events-none">
										<ListItemPrefix className="mr-2">
											<VariableIcon className="h-5 w-5 my-2 text-blue-gray-500" />
										</ListItemPrefix>
										<Typography>Algorithm:</Typography>
										<ListItemSuffix className="inline-flex pl-4">
											<Typography>SHA1</Typography>
										</ListItemSuffix>
									</ListItem>
								</List>
							</Collapse>
						</TabPanel>
						<TabPanel key={'qr-code'} value={'qr-code'}>
							<Typography className="text-center mb-4">
								You can configure two-factor authentication (2FA) using a mobile app. You can add a token automatically by scanning the following QR code:
							</Typography>
							<QRCode className="mx-auto" value={`otpauth://totp/ft_transcendence?secret=${info.twoFactorSecret}&algorithm=SHA1&digits=6&period=30`} />
						</TabPanel>
					</TabsBody>
				</Tabs>
				<div className="flex items-center">
					<ExclamationTriangleIcon strokeWidth={2} className="h-16 w-16 text-red-500" />
					<Typography className="text-center" variant="h6" color="red">
						Once this popup is closed, the code will no longer be visible! It is important to save this code now, otherwise you may lose access to your account.
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
			{(state === 'initial' || state === 'editing') && editing}
			{state === 'loading' && loading}
			{state === 'two-factor-secret' && twoFactorSecret}
		</Dialog>
	);
}
