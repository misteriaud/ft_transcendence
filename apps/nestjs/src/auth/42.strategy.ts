import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, InternalOAuthError } from 'passport-oauth2';
import { Profile } from 'passport';
import { parse42payload } from '../utils/oauth.utils';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
	private _profileURL: string;
	constructor() {
		super({
			// Configure the OAuth2 strategy options here
			authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
			tokenURL: 'https://api.intra.42.fr/oauth/token',
			clientID: process.env.OAUTH_42_UID,
			clientSecret: process.env.OAUTH_42_SECRET,
			callbackURL: process.env.OAUTH_CALLBACK_URL,
			scope: 'public', // public scope indicates that the app doesn't need to access user's private data
		});
		this.name = '42';
		this._profileURL = 'https://api.intra.42.fr/v2/me';
		// this._oauth2.useAuthorizationHeaderforGET(true);
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
