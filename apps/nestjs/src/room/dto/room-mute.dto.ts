import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty } from 'class-validator';

export class RoomMuteDto {
	@Type(() => Date)
	@IsDate()
	@IsNotEmpty()
	mute_until: Date;
}
