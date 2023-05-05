import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, InternalOAuthError } from 'passport-oauth2';
import { AuthService } from './auth.service'; // Import your AuthService or any other service you want to use for authentication
import { Interface } from 'readline';
import { Profile } from 'passport';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
	private _profileURL: string;
	constructor(private readonly authService: AuthService) {
		super({
			// Configure the OAuth2 strategy options here
			authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
			tokenURL: 'https://api.intra.42.fr/oauth/token',
			clientID: process.env.NESTJS_OAUTH_42_UID,
			clientSecret: process.env.NESTJS_OAUTH_42_SECRET,
			callbackURL: process.env.NESTJS_OAUTH_CALLBACK_URL,
		});
		this.name = '42';
		this._profileURL = 'https://api.intra.42.fr/v2/me';
		// this._oauth2.useAuthorizationHeaderforGET(true);
	}

	parse42payload(err: any, json: any, resolve: (value: Profile) => void, reject: (reason?: any) => void): void {
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

	async validate(accessToken: string, _refreshToken: string, _profile: Profile, _done: VerifyCallback): Promise<Profile> {
		// Implement your validation logic here
		// You can use the `accessToken` and other information received from the OAuth2 provider
		// to verify and authenticate the user
		// You can also call your AuthService or any other service to perform authentication
		return new Promise<Profile>((resolve, reject) => {
			this._oauth2.get(this._profileURL, accessToken, (err, body) => {
				this.parse42payload(err, body, resolve, reject);
			});
		});
	}
}
