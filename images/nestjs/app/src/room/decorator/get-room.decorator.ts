import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const GetRoom = createParamDecorator((data: string | undefined, context: ExecutionContext) => {
	const request = context.switchToHttp().getRequest();
	const room = request.room;

	if (data) {
		return room[data];
	}
	return room;
});
