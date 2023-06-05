import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { existsSync } from 'fs';
import { join } from 'path';

@Controller('static')
export class StaticController {
	// SERVE STATIC CONTENT

	// Get avatar
	@Get('uploads/avatar/:filename')
	getAvatar(@Param('filename') fileName: string, @Res() res: Response) {
		const dir = 'static/uploads/avatar';

		if (existsSync(join(dir, fileName))) {
			res.sendFile(fileName, { root: dir });
		} else if (existsSync(join(dir, 'default'))) {
			res.sendFile('default', { root: dir });
		} else {
			res.status(404).send('Avatar not found');
		}
	}
}
