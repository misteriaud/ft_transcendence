import { useEffect } from 'react';
import { useLoaderData, Navigate, LoaderFunctionArgs, redirect } from 'react-router-dom';
import { useStoreDispatchContext } from '../hooks/useContext';
import { StoreActionType } from '../context/storeProvider';
import { apiProvider } from '../hooks/useApi';
import { useMe } from '../hooks/useUser';
import { Totp } from '../components/totp';

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url);
	const code = url.searchParams.get('code');
	const intra_url = 'https://api.intra.42.fr/oauth/authorize';
	const redirect_url = `${intra_url}?response_type=code&redirect_uri=${process.env.REACT_APP_OAUTH_CALLBACK_URL}&client_id=${process.env.REACT_APP_OAUTH_42_UID}`;

	if (!code) {
		return redirect(redirect_url);
	}

	const response = await apiProvider()
		.get('auth/login', {
			params: { code }
		})
		.then((result) => {
			return result.data;
		})
		.catch((error) => {
			console.log(error);
			return null;
		});
	return response;
};

interface Payload {
	jwt: string;
	authorized: boolean;
}

export const LoginPage = () => {
	const { loggedIn } = useMe();
	const dispatch = useStoreDispatchContext();
	const payload = useLoaderData() as Payload | null;

	useEffect(() => {
		if (payload)
			dispatch({
				type: StoreActionType.LOGIN,
				content: payload.jwt
			});
	}, [payload]);

	let inside = (
		<>
			<h1>Login failed</h1>
			<button>Retry</button>
		</>
	);

	if (loggedIn) {
		return <Navigate to="/dashboard" />;
	}

	if (payload && !payload.authorized) inside = <Totp />;

	return <div className="absolute inset-0 bg-gray-400 flex justify-center items-center">{inside}</div>;
};
