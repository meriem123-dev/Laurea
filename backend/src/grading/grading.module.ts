import { Module } from '@nestjs/common';
import { GradingService } from './grading.service';
import { GradingController } from './grading.controller';
import { ResultsController } from './results.controller';

@Module({
  controllers: [GradingController,ResultsController],
  providers: [GradingService],
  exports: [GradingService],
})
export class GradingModule {}