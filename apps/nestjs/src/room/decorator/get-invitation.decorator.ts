import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const GetInvitation = createParamDecorator((data: string | undefined, context: ExecutionContext) => {
	const request = context.switchToHttp().getRequest();
	const invitation = request.invitation;

	if (data) {
		return invitation[data];
	}
	return invitation;
});
