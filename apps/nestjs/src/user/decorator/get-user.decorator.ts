import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const GetOther = createParamDecorator((data: string | undefined, context: ExecutionContext) => {
	const request = context.switchToHttp().getRequest();
	const other = request.other;

	if (data) {
		return other[data];
	}
	return other;
});
