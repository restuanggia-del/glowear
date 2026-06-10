import { Module } from '@nestjs/common';
import { CustomDesignService } from './custom-design.service';
import { CustomDesignController } from './custom-design.controller';

@Module({
  controllers: [CustomDesignController],
  providers: [CustomDesignService],
})
export class CustomDesignModule {}
