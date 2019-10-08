import * as moment from 'moment';
import * as React from 'react';

import { NODE_PHASE, Schedule } from '../../../models';
import { Duration, Ticker } from '../../shared/components';

export const ScheduleSummaryPanel = (props: { schedule: Schedule }) => (
    <Ticker disabled={props.schedule && props.schedule.status.phase !== NODE_PHASE.RUNNING}>
        {(now) => {
            const endTime = props.schedule.status.finishedAt ? moment(props.schedule.status.finishedAt) : now;
            const duration = endTime.diff(moment(props.schedule.status.startedAt)) / 1000;

            const attributes = [
                {title: 'Status', value: props.schedule.status.phase},
                {title: 'Name', value: props.schedule.metadata.name},
                {title: 'Namespace', value: props.schedule.metadata.namespace},
                {title: 'Started At', value: props.schedule.status.startedAt},
                {title: 'Finished At', value: props.schedule.status.finishedAt || '-'},
                {title: 'Duration', value: <Duration durationMs={duration}/>},
            ];
            return (
                <div className='white-box'>
                    <div className='white-box__details'>
                        {attributes.map((attr) => (
                            <div className='row white-box__details-row' key={attr.title}>
                                <div className='columns small-3'>
                                    {attr.title}
                                </div>
                                <div className='columns small-9'>{attr.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }}
    </Ticker>
);
