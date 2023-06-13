import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-oauth2';
import { Profile } from 'passport';
import { parse42payload } from '../utils/oauth.utils';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
	private readonly _profileURL = 'https://api.intra.42.fr/v2/me';

	constructor() {
		super({
			authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
			tokenURL: 'https://api.intra.42.fr/oauth/token',
			clientID: process.env.OAUTH_42_UID,
			clientSecret: process.env.OAUTH_42_SECRET,
			callbackURL: process.env.OAUTH_CALLBACK_URL,
			scope: 'public',
		});
		this.name = '42';
	}

	async validate(accessToken: string, _refreshToken: string, _profile: Profile, _done: VerifyCallback): Promise<Profile> {
		return new Promise<Profile>((resolve, reject) => {
			this._oauth2.get(this._profileURL, accessToken, (err, body) => {
				parse42payload(err, body, resolve, reject);
			});
		});
	}
}
