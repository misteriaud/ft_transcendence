/* import { NestFactory } from ' @nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma.service';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const prismaService: PrismaService = app.get(PrismaService);

	// Perform any necessary database initialization here

	const server = app.getHttpServer();
	const io = require('socket.io')(server);

	io.on('connection', (socket) => {
		// Handle incoming socket.io events here

		socket.on('playerInput', (input) => {
			// Handle player input here and broadcast it to other players
			socket.broadcast.emit('playerInput', input);
		});

		socket.on('disconnect', () => {
		// Handle player disconnect here
		});
	});

	await app.listen(PORT);
}

bootstrap();
*/
