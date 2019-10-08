import * as classNames from 'classnames';
import * as React from 'react';

import * as models from '../../../../models';
import { Utils } from '../../../shared/components';

import { ScheduleSteps } from '../schedule-steps/schedule-steps';

require('./schedule-list-item.scss');

export interface ScheduleListItemProps { schedule: models.Schedule; }

export const ScheduleListItem = (props: ScheduleListItemProps) => (
    <div className='schedule-list-item'>
        <div className='schedule-list-item__top'>
            <div className='schedule-list-item__status'>
                <div className='schedule-list-item__status-icon'>
                    <i className={classNames('fa', Utils.statusIconClasses(props.schedule.status.phase))}  aria-hidden='true'/>
                </div>
                <div className='schedule-list-item__status-message'>
                    {props.schedule.metadata.creationTimestamp}
                </div>
            </div>
        </div>

        <div className='schedule-list-item__content'>
            <div className='row collapse'>
                <div className='columns medium-7'>
                    <div className='schedule-list-item__content-box'>
                        <ScheduleSteps schedule={props.schedule}/>
                    </div>
                </div>
                <div className='columns medium-5'>
                    <div className='schedule-list-item__content-details'>
                        <div className='schedule-list-item__content-details-row row'>
                            <div className='columns large-4'>NAME:</div>
                            <div className='columns large-8'>{props.schedule.metadata.name}</div>
                        </div>
                        <div className='schedule-list-item__content-details-row row'>
                            <div className='columns large-4'>NAMESPACE:</div>
                            <div className='columns large-8'>{props.schedule.metadata.namespace}</div>
                        </div>
                        <div className='schedule-list-item__content-details-row row'>
                            <div className='columns large-4'>CREATED AT:</div>
                            <div className='columns large-8'>{props.schedule.metadata.creationTimestamp}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
