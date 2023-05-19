import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as cors from 'cors';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.useWebSocketAdapter(new IoAdapter(app));

	//const corsOptions = {
	//	origin: 'http://localhost:8080',
	//	methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
	//	credentials: true,
	//};
	//app.enableCors(corsOptions);
	app.use(cors());

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
		}),
	);
	await app.listen(process.env.PORT || 3000);
}
bootstrap();
