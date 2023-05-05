import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const GetInvitationToken = createParamDecorator((data: string | undefined, context: ExecutionContext) => {
	const request = context.switchToHttp().getRequest();
	const invitationToken = request.invitationToken;

	if (data) {
		return invitationToken[data];
	}
	return invitationToken;
});
