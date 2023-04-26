import { IsNotEmpty } from 'class-validator';

export class Validate2faDTO {
	@IsNotEmpty()
	totp: string;
}
