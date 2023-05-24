import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.useWebSocketAdapter(new IoAdapter(app));
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
		}),
	);

	const config = new DocumentBuilder()
		.setTitle('ft_transcendence API')
		.setDescription(
			"Welcome to the OpenAPI documentation for the backend of the 'ft_transcendence' project, built with NestJS. This documentation provides a comprehensive overview of the API endpoints available for interacting with the application, including descriptions of each endpoint's functionality, input and output parameters, response codes...",
		)
		.setVersion('1.0')
		.addOAuth2()
		.addBearerAuth()
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, document);

	await app.listen(process.env.PORT || 3000);
}
bootstrap();
