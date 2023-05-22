import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const GetMessage = createParamDecorator((data: string | undefined, context: ExecutionContext) => {
	const request = context.switchToHttp().getRequest();
	const message = request.message;

	if (data) {
		return message[data];
	}
	return message;
});
