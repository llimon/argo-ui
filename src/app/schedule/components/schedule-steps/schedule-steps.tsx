import * as classNames from 'classnames';
import * as React from 'react';

import * as models from '../../../../models';

require('./schedule-steps.scss');

export interface ScheduleStepsProps { schedule: models.Schedule; }

export const ScheduleSteps = (props: ScheduleStepsProps) => {
    const entryPointTemplate = props.schedule.spec.templates.find((template) => template.name === props.schedule.spec.entrypoint) || { steps: [] as models.ScheduleStep[][] };
    const phase = props.schedule.status.phase;
    let isSucceeded = false;
    let isFailed = false;
    let isRunning = false;
    if (phase === models.NODE_PHASE.RUNNING) {
        isRunning = true;
    } else {
        isSucceeded = phase === models.NODE_PHASE.SUCCEEDED;
        isFailed = !isSucceeded;
    }
    const steps = (entryPointTemplate.steps || []).map((group) => group[0]).map((step) => ({ name: step.name, isSucceeded, isFailed, isRunning })).slice(0, 3);

    return (
    <div className='schedule-steps'>
        <div className='schedule-steps__title'>
            <div className='schedule-steps__icon'>
                <i className='ax-icon-job' aria-hidden='true'/>
            </div>
            <div className='schedule-steps__description'>
                <div className='schedule-steps__description-title'>{props.schedule.metadata.name}</div>
            </div>
        </div>
        <div className='schedule-steps__timeline'>
            <div className='schedule-steps__step-dots'>
                <div className='schedule-steps__step-circle schedule-steps__step-circle-small'/>
                <div className='schedule-steps__step-circle schedule-steps__step-circle-small'/>
                <div className='schedule-steps__step-circle schedule-steps__step-circle-small'/>
                <div className='schedule-steps__step-name'>&nbsp;</div>
            </div>
            {steps.map((step) => (
                <div key={step.name} className={classNames('schedule-steps__step', {
                        'schedule-steps__step--succeeded': step.isSucceeded,
                        'schedule-steps__step--failed': step.isFailed,
                        'schedule-steps__step--running': step.isRunning})}>
                    <div className={classNames('schedule-steps__step-circle', {
                            'schedule-steps__step-circle--succeeded': step.isSucceeded,
                            'schedule-steps__step-circle--failed': step.isFailed,
                            'schedule-steps__step-circle--running': step.isRunning})} />
                    <div className='schedule-steps__step-name'>{step.name}</div>
                </div>
            ))}
        </div>
    </div>
    );
};
