import { Module } from '@nestjs/common';
import { TcpServerService } from './tcp-server.service';


@Module({
  providers: [TcpServerService],
  exports:[TcpServerService],
})
export class TcpServerModule {}
