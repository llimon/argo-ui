import { Observable } from 'rxjs';

import * as models from '../../../models';
import requests from './requests';

export class ScheduleService {

    public get(namespace: string, name: string): Promise<models.Schedule> {
        return requests.get(`/schedules/${namespace}/${name}`).then((res) => res.body as models.Schedule).then(this.populateDefaultFields);
    }

    public list(phases: string[]): Promise<models.Schedule[]> {
        return requests.get('/schedules').query({ phase: phases }).then((res) => res.body as models.ScheduleList).then((list) => list.items.map(this.populateDefaultFields));
    }

    public watch(filter?: {namespace: string; name: string} | Array<string>): Observable<models.WatchEvent<models.Schedule>> {
        let url = '/schedules/live';
        if (filter) {
            if (filter instanceof Array) {
                const phases = (filter as Array<string>).map((phase) => `phase=${phase}`).join('&');
                url = `${url}?${phases}`;
            } else {
                const schedule = filter as {namespace: string; name: string};
                url = `${url}?namespace=${schedule.namespace}&name=${schedule.name}`;
            }
        }
        return requests.loadEventSource(url).repeat().retry().map((data) => JSON.parse(data) as models.WatchEvent<models.Schedule>).map((watchEvent) => {
            watchEvent.object = this.populateDefaultFields(watchEvent.object);
            return watchEvent;
        });
    }

    public getContainerLogs(schedule: models.Schedule, nodeId: string, container: string): Observable<string> {
        return requests.loadEventSource(`/logs/${schedule.metadata.namespace}/${schedule.metadata.name}/${nodeId}/${container}`).map((line) => {
            return line ? line + '\n' : line;
        });
    }

    public getArtifactDownloadUrl(schedule: models.Schedule, nodeId: string, artifactName: string) {
        return `/api/schedules/${schedule.metadata.namespace}/${schedule.metadata.name}/artifacts/${nodeId}/${encodeURIComponent(artifactName)}`;
    }

    private populateDefaultFields(schedule: models.Schedule): models.Schedule {
        schedule = {status: { nodes: {} }, ...schedule};
        schedule.status.nodes = schedule.status.nodes || {};
        return schedule;
    }
}
