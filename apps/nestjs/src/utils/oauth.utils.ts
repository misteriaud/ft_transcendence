import { Profile } from 'passport';
import { InternalOAuthError } from 'passport-oauth2';

export const parse42payload = (err: any, json: any, resolve: (value: Profile) => void, reject: (reason?: any) => void): void => {
	if (err) {
		if (err.data) {
			try {
				json = JSON.parse(err.data);
			} catch (_) {}
		}

		const errorMessage = (json && json.message) ? json.message : 'Failed to fetch user profile';
		reject(new InternalOAuthError(errorMessage, err));
	}

	try {
		json = JSON.parse(json);
	} catch (ex) {
		reject(new Error('Failed to parse user profile'));
	}

	const { id, login, displayname, last_name, first_name, email, image } = json;

	const profile: Profile = {
		provider: '42',
		id,
		username: login,
		displayName: displayname,
		name: {
			familyName: last_name,
			givenName: first_name,
			middleName: '',
		},
		emails: [{ value: email, type: 'default' }],
		photos: [{ value: image.link }],
	};

	resolve(profile);
}

