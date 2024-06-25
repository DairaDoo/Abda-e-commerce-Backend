import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const port = 4000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: ["http://localhost:3000", "https://abda-ecomerce-frontend-bigk-git-abimael-abimael-santas-projects.vercel.app"],
    credentials: true,
    methods: ["POST", "GET", "DELETE", "PUT"],
    allowedHeaders: ['Content-Type', 'Origin', 'X-Requested-With', 'Accept', 'Authorization'],
    exposedHeaders: ['Authorization']
  });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Abda-Ecommerce')
    .setDescription('Documentación de las rutas del Backend.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(port, "0.0.0.0");
  console.log("Server is running on port", port);
  console.log("Hello, world!");
  console.log("Mail: ")
  console.log(process.env.GOOGLE_MAIL_APP_EMAIL);
}

bootstrap();
