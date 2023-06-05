import { Navigate, redirect } from 'react-router-dom';
import { useStoreDispatchContext } from '../hooks/useContext';
import { useApi } from '../hooks/useApi';
import { useMe } from '../hooks/useUser';
import { Spinner } from '@material-tailwind/react';
import { StoreActionType } from '../context/storeProvider';
import { useState } from 'react';

export const LoginFakePage = () => {
	const [name, setName] = useState('');
	const { isLoading, loggedIn } = useMe();
	const dispatch = useStoreDispatchContext();
	const api = useApi();

	async function login() {
		await api
			.get('auth/login_fake', { params: { name } })
			.then((result) => {
				dispatch({
					type: StoreActionType.LOGIN,
					content: result.data.jwt
				});
			})
			.catch((error) => {
				console.log(error);
			});
	}

	if (isLoading) return <Spinner />;

	if (loggedIn) return <Navigate to="/dashboard" />;

	return (
		<div>
			Connect as <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)}></input>
			<button onClick={login}>Login</button>
		</div>
	);
};
