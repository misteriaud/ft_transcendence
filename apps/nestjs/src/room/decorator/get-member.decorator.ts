import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const GetMember = createParamDecorator((data: string | undefined, context: ExecutionContext) => {
	const request = context.switchToHttp().getRequest();
	const member = request.member;

	if (data) {
		return member[data];
	}
	return member;
});
