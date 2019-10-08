import * as PropTypes from 'prop-types';
import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Observable } from 'rxjs';

import * as models from '../../../../models';
import { uiUrl } from '../../../shared/base';
import { DataLoader, MockupList, Page, TopBarFilter } from '../../../shared/components';
import { AppContext } from '../../../shared/context';
import { services } from '../../../shared/services';

import { ScheduleListItem } from '../schedule-list-item/schedule-list-item';

export class ScheduleList extends React.Component<RouteComponentProps<any>> {

    public static contextTypes = {
        router: PropTypes.object,
        apis: PropTypes.object,
    };

    private get phases() {
        return new URLSearchParams(this.props.location.search).getAll('phase');
    }

    public render() {
        const filter: TopBarFilter<string> = {
            items: Object.keys(models.NODE_PHASE).map((phase) => ({
                value: (models.NODE_PHASE as any)[phase],
                label: (models.NODE_PHASE as any)[phase],
            })),
            selectedValues: this.phases,
            selectionChanged: (phases) => {
                const query = phases.length > 0 ? '?' + phases.map((phase) => `phase=${phase}`).join('&') : '';
                this.appContext.router.history.push(uiUrl(`schedule${query}`));
            },
        };
        return (
            <Page title='Schedule' toolbar={{filter, breadcrumbs: [{ title: 'Schedule', path: uiUrl('schedule') }]}}>
                <div className='argo-container'>
                    <div className='stream'>
                        <DataLoader
                                input={this.phases}
                                load={(phases) => {
                                    return Observable.fromPromise(services.schedule.list(phases)).flatMap((schedule) =>
                                        Observable.merge(
                                            Observable.from([schedule]),
                                            services.schedule.watch(phases).map((scheduleChange) => {
                                                const index = schedule.findIndex((item) => item.metadata.name === scheduleChange.object.metadata.name);
                                                if (index > -1 && scheduleChange.object.metadata.resourceVersion === schedule[index].metadata.resourceVersion) {
                                                    return {schedule, updated: false};
                                                }
                                                switch (scheduleChange.type) {
                                                    case 'DELETED':
                                                        if (index > -1) {
                                                            schedule.splice(index, 1);
                                                        }
                                                        break;
                                                    default:
                                                        if (index > -1) {
                                                            schedule[index] = scheduleChange.object;
                                                        } else {
                                                            schedule.unshift(scheduleChange.object);
                                                        }
                                                        break;
                                                }
                                                return {schedule, updated: true};
                                            }).filter((item) => item.updated).map((item) => item.schedule)),
                                    );
                                }}
                                loadingRenderer={() => <MockupList height={150} marginTop={30}/>}>
                            {(schedule: models.Schedule[]) => schedule.map((schedule) => (
                                <div key={schedule.metadata.name}>
                                    <Link to={uiUrl(`schedule/${schedule.metadata.namespace}/${schedule.metadata.name}`)}>
                                    <ScheduleListItem schedule={schedule}/>
                                    </Link>
                                </div>
                            ))}
                        </DataLoader>
                    </div>
                </div>
            </Page>
        );
    }

    private get appContext(): AppContext {
        return this.context as AppContext;
    }
}
