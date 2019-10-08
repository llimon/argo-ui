import * as React from 'react';

import * as models from '../../../models';
import { services } from '../../shared/services';

interface Props {
    schedule: models.Schedule;
}

export const ScheduleArtifacts = (props: Props) => {
    const scheduleStatusNodes = props.schedule.status && props.schedule.status.nodes || {};
    const artifacts = Object.keys(scheduleStatusNodes)
        .map((nodeName) => {
            const node = scheduleStatusNodes[nodeName];
            const nodeOutputs = (node.outputs || { artifacts: [] as models.Artifact[] });
            const items = nodeOutputs.artifacts || [];
            return items.map((item) => Object.assign({}, item, {
                downloadUrl: services.schedule.getArtifactDownloadUrl(props.schedule, node.id, item.name),
                stepName: node.name,
                dateCreated: node.finishedAt,
                nodeName,
            }));
        })
        .reduce((first, second) => first.concat(second), []) || [];
    if (artifacts.length === 0) {
        return (
            <div className='white-box'>
                <div className='row'>
                    <div className='columns small-12 text-center'>No data to display</div>
                </div>
            </div>
        );
    }
    return (
        <div className='white-box'>
            <div className='white-box__details'>
                {artifacts.map((artifact) => (
                    <div className='row white-box__details-row'  key={artifact.path}>
                        <div className='columns small-2'>
                            <span>
                                <a href={artifact.downloadUrl}> <i className='icon argo-icon-artifact'/></a> {artifact.name}
                            </span>
                        </div>
                        <div className='columns small-4'>{artifact.stepName}</div>
                        <div className='columns small-3'>{artifact.path}</div>
                        <div className='columns small-3'>{artifact.dateCreated}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};
