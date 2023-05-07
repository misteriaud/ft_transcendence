import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Profile } from 'passport';

export const GetUser = createParamDecorator((data: string | undefined, context: ExecutionContext) => {
	const request = context.switchToHttp().getRequest();
	const user = request.user;

	if (data) {
		return user[data];
	}
	return user;
});

export const GetOAuthUser = createParamDecorator((data: string | undefined, context: ExecutionContext): Profile => {
	const request = context.switchToHttp().getRequest();
	const user = request.user;

	if (data) {
		return user[data];
	}
	return user;
});
