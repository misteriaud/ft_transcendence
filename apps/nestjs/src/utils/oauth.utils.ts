import { Profile } from 'passport';
import { InternalOAuthError } from 'passport-oauth2';

export const parse42payload = (err: any, json: any, resolve: (value: Profile) => void, reject: (reason?: any) => void): void => {
	if (err) {
		if (err.data) {
			try {
				json = JSON.parse(err.data);
			} catch (_) {
				// nothing
			}
		}
		if (json && json.message) {
			reject(new InternalOAuthError(json.message, err));
		}
		reject(new InternalOAuthError('Failed to fetch user profile', err));
	}

	try {
		json = JSON.parse(json);
	} catch (ex) {
		reject(new Error('Failed to parse user profile'));
	}
	// console.log(json.id);
	resolve({
		provider: '42',
		id: json.id,
		username: json.login,
		displayName: json.displayname,
		name: {
			familyName: json.last_name,
			givenName: json.first_name,
			middleName: '',
		},
		emails: [
			{
				value: json.email,
				type: 'default',
			},
		],
		photos: [
			{
				value: json.image.link,
			},
		],
	});
}

