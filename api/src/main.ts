import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  // 1. Buat instance 'app' terlebih dahulu
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 2. Terapkan global pipes setelah 'app' terbuat
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true }
  }));

  // 3. Konfigurasi CORS
  app.enableCors();

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // 4. Konfigurasi Swagger API Docs
  const config = new DocumentBuilder()
    .setTitle('Glowear API')
    .setDescription('Dokumentasi lengkap REST API untuk sistem Glowear.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 5. Jalankan server
  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();