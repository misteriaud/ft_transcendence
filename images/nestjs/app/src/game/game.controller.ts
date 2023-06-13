import { Controller, Get, NotFoundException, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JWTGuard } from 'src/auth/guard/JWT.guard';
import { PrismaMatchService } from './prismaMatch.service';

@ApiBearerAuth()
@ApiTags('pong')
@UseGuards(JWTGuard)
@Controller('pong')
export class GameController {
	constructor(private prismaMatchService: PrismaMatchService) {}

	// @ApiOkResponse({ type: User })
	// @ApiUnauthorizedResponse({ description: 'Unauthorized' })
	@Get(':id')
	async get(@Param('id') id: string) {
		const entry = await this.prismaMatchService.get(id);

		if (!entry) {
			throw new NotFoundException(`There is no Game with this ID`);
		}
		return entry;
	}
}
