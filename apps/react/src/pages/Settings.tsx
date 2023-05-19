// Home.jsx
import { useState } from 'react';
import { useMe } from '../hooks/useUser';
import { useApi } from '../hooks/useApi';

export const SettingsPage = () => {
	const { me, mutate } = useMe();
	const [userSettings, setUserSettings] = useState({
		username: me.username,
		twoFactorEnabled: me.twoFactorEnabled
	});
	const [error, setError] = useState('');
	const api = useApi();

	function handleInput(e: any) {
		setUserSettings({
			...userSettings,
			username: e.target.value
		});
	}

	async function submitSettings(e: any) {
		e.preventDefault();
		setError('');
		api
			.put('users/me', userSettings)
			.then((result) => {
				mutate({
					...me,
					...userSettings
				});
				if (result.data.twoFactorSecret) alert(`nouveau secret: ${result.data.twoFactorSecret}`);
			})
			.catch((error) => {
				// setTotp("");
				setError(error.response.data.message);
			});
	}

	return (
		<div>
			<h1>Bonjour {me.username}</h1>
			{error && <h1>An error happened: {error}</h1>}
			<form onSubmit={submitSettings}>
				<input value={userSettings.username} onChange={handleInput}></input>
				2FA:
				<input
					type="checkbox"
					checked={userSettings.twoFactorEnabled}
					value={userSettings.twoFactorEnabled ? 'Desactiver la 2FA' : 'Activer la 2FA'}
					onChange={() =>
						setUserSettings({
							...userSettings,
							twoFactorEnabled: !userSettings.twoFactorEnabled
						})
					}
				/>
				<button type="submit">Enregistrer</button>
			</form>
		</div>
	);
};
