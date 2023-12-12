import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TcpServerService } from './tcp-server/tcp-server.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const tcpServerService = app.get(TcpServerService);

  tcpServerService.startServer();
  // await app.listen(3100);
}
bootstrap();
