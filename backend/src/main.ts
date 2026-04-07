import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // 1. Buat instance 'app' terlebih dahulu
  const app = await NestFactory.create(AppModule);

  // 2. Terapkan global pipes setelah 'app' terbuat
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true }
  }));

  // 3. Konfigurasi CORS
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // 4. Jalankan server
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();