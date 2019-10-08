import { WorkflowsService } from './workflows-service';
import { ScheduleService } from './schedule-service';

export interface Services {
    workflows: WorkflowsService;
    schedule: ScheduleService;
}

export * from './workflows-service';
export * from './schedule-service';

export const services: Services = {
    workflows: new WorkflowsService(),
    schedule: new ScheduleService(),
};
