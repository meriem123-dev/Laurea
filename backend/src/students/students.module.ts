import { Module } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { AuthModule } from '../auth/auth.module';
import { StudentsImportService } from './students-import.service';

@Module({
  controllers: [StudentsController],
  providers: [StudentsService,StudentsImportService],
  imports: [AuthModule],
})
export class StudentsModule {}
