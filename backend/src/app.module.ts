import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GradingModule } from './grading/grading.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GradingModule,
    // Partie B : PrismaModule + HealthController
  ],
})
export class AppModule {}