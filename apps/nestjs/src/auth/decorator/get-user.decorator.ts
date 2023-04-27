import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const GetUser = createParamDecorator((data: string | undefined, context: ExecutionContext) => {
	const request = context.switchToHttp().getRequest();
	const user = request.user;

	if (data) {
		return user[data];
	}
	return user;
});
