import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { RoomGetService } from './guard/roomGet.service';

@Module({
	imports: [JwtModule.register({})],
	controllers: [RoomController],
	providers: [RoomService, RoomGetService],
})
export class RoomModule {}
