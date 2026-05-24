import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SessionCleanupTask } from './session-cleanup.task';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [SessionCleanupTask],
})
export class TasksModule {}
