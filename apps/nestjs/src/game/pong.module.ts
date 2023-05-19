import { Module } from '@nestjs/common';
import { PongGateway } from './pongGateway';
import { UserModule } from '../user/user.module';

@Module({
	imports: [UserModule],
	providers: [PongGateway],
})
export class PongModule {}
