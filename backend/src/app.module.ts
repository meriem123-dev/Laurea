import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GradingModule } from './grading/grading.module';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';

import { UsersModule } from './users/users.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, GradingModule,UsersModule,],
  controllers: [HealthController],
})
export class AppModule {}