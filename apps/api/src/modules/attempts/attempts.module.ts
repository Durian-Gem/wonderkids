import { Module, forwardRef } from '@nestjs/common';
import { AttemptsController } from './attempts.controller';
import { AttemptsService } from './attempts.service';
import { ReviewModule } from '../review/review.module';

@Module({
  imports: [forwardRef(() => ReviewModule)],
  controllers: [AttemptsController],
  providers: [AttemptsService],
  exports: [AttemptsService]
})
export class AttemptsModule {}
