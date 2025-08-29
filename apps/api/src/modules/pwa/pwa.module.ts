import { Module } from '@nestjs/common';
import { PWAController } from './pwa.controller';
import { PWAService } from './pwa.service';

@Module({
  controllers: [PWAController],
  providers: [PWAService],
  exports: [PWAService],
})
export class PWAModule {}
