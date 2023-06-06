import { useState } from 'react';
import { Button, Card, CardBody, CardFooter, CardHeader, Spinner, Typography } from '@material-tailwind/react';
import OTPInput from 'react-otp-input';
import { StoreActionType } from '../context/storeProvider';
import { useStoreDispatchContext } from '../hooks/useContext';
import { useApi } from '../hooks/useApi';
import { useNotifyError, useNotifySuccess } from '../hooks/notifications';

export function Totp() {
	const [state, setState] = useState('initial');
	const [totp, setTotp] = useState('');
	const dispatch = useStoreDispatchContext();
	const notifySuccess = useNotifySuccess();
	const notifyError = useNotifyError();
	const api = useApi();

	async function handleSignIn() {
		setState('loading');
		await api
			.post('auth/2fa', {
				totp
			})
			.then((res) => {
				notifySuccess('You are logged in.');
				setTotp('');
				setState('initial');
				dispatch({
					type: StoreActionType.LOGIN,
					content: res.data.jwt
				});
			})
			.catch(() => {
				notifyError('Invalid TOTP.');
				setTotp('');
				setState('signing-in');
			});
	}

	return (
		<Card className="w-96">
			<CardHeader variant="gradient" color="blue" className="grid h-28 place-items-center">
				<Typography variant="h3" color="white">
					TOTP
				</Typography>
			</CardHeader>
			<CardBody className="flex flex-col gap-4 ">
				<Typography variant="h5" className="text-center">
					Enter verification code
				</Typography>
				<OTPInput
					containerStyle={'justify-center justify-around'}
					value={totp}
					onChange={setTotp}
					numInputs={6}
					renderSeparator={<span>-</span>}
					renderInput={(props) => <input {...props} />}
					inputStyle="flex-auto max-w-[2rem] px-1 py-2.5 font-normal transition-all border focus:border-2 rounded-md border-blue-gray-200 focus:border-blue-500 outline outline-0 focus:outline-0"
					inputType="tel"
					shouldAutoFocus={true}
				/>
			</CardBody>
			<CardFooter className="pt-0">
				{state === 'loading' ? (
					<Button className="h-12" variant="gradient" fullWidth disabled={true}>
						<Spinner className="mx-auto" />
					</Button>
				) : (
					<Button className="h-12" variant="gradient" fullWidth onClick={handleSignIn}>
						Sign In
					</Button>
				)}
			</CardFooter>
		</Card>
	);
}
