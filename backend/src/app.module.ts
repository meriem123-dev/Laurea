import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GradingModule } from './grading/grading.module';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { StudentsModule } from './students/students.module';
import { TeachersModule } from './teachers/teachers.module';
import { RoomsModule } from './rooms/rooms.module';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, GradingModule,UsersModule,AuthModule, StudentsModule, TeachersModule, RoomsModule,ProjectsModule],
  controllers: [HealthController],
})
export class AppModule {}