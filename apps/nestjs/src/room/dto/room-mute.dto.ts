import { IsDateString, IsNotEmpty } from 'class-validator';

export class RoomMuteDto {
	@IsDateString()
	@IsNotEmpty()
	muted_until: string;
}
