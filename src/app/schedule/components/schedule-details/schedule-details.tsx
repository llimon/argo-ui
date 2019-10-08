import * as classNames from 'classnames';
import * as PropTypes from 'prop-types';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { Observable, Subscription } from 'rxjs';

import * as models from '../../../../models';
import { uiUrl } from '../../../shared/base';
import { LogsViewer,  NotificationType, Page, SlidingPanel } from '../../../shared/components';
import { AppContext } from '../../../shared/context';
import { services } from '../../../shared/services';

import { ScheduleArtifacts } from '../schedule-artifacts';
import { ScheduleDag } from '../schedule-dag/schedule-dag';
import { ScheduleNodeInfo } from '../schedule-node-info/schedule-node-info';
import { ScheduleParametersPanel } from '../schedule-parameters-panel';
import { ScheduleSummaryPanel } from '../schedule-summary-panel';
import { ScheduleTimeline } from '../schedule-timeline/schedule-timeline';
import { ScheduleYamlViewer } from '../schedule-yaml-viewer/schedule-yaml-viewer';

require('./schedule-details.scss');

function parseSidePanelParam(param: string) {
    const [type, nodeId, container] = (param || '').split(':');
    if (type === 'logs' || type === 'yaml') {
        return { type, nodeId, container };
    }
    return null;
}

export class ScheduleDetails extends React.Component<RouteComponentProps<any>, { schedule: models.Schedule }> {

    public static contextTypes = {
        router: PropTypes.object,
        apis: PropTypes.object,
    };

    private changesSubscription: Subscription;
    private timelineComponent: ScheduleTimeline;

    private get selectedTabKey() {
        return new URLSearchParams(this.props.location.search).get('tab') || 'schedule';
    }

    private get selectedNodeId() {
        return new URLSearchParams(this.props.location.search).get('nodeId');
    }

    private get sidePanel() {
        return parseSidePanelParam(new URLSearchParams(this.props.location.search).get('sidePanel'));
    }

    constructor(props: RouteComponentProps<any>) {
        super(props);
        this.state = { schedule: null };
    }

    public componentWillMount() {
        this.loadSchedule(this.props.match.params.namespace, this.props.match.params.name);
    }

    public componentWillReceiveProps(nextProps: RouteComponentProps<any>) {
        if (this.props.match.params.name !== nextProps.match.params.name || this.props.match.params.namespace !== nextProps.match.params.namespace) {
            this.loadSchedule(nextProps.match.params.namespace, nextProps.match.params.name);
        }
    }

    public componentDidUpdate(prevProps: RouteComponentProps<any>) {
        // Redraw timeline component after node details panel collapsed/expanded.
        const prevSelectedNodeId = new URLSearchParams(this.props.location.search).get('nodeId');
        if (this.timelineComponent && !!this.selectedNodeId !== !!prevSelectedNodeId) {
            setTimeout(() => {
                this.timelineComponent.updateWidth();
            }, 300);
        }
    }

    public componentWillUnmount() {
        this.ensureUnsubscribed();
    }

    public render() {
        const selectedNode = this.state.schedule && this.state.schedule.status && this.state.schedule.status.nodes[this.selectedNodeId];
        return (
            <Page title={'Schedule Details'} toolbar={{
                    breadcrumbs: [{ title: 'Schedule', path: uiUrl('schedule') }, { title: this.props.match.params.name }],
                    tools: (
                        <div className='schedule-details__topbar-buttons'>
                            <a className={classNames({ active: this.selectedTabKey === 'summary' })} onClick={() => this.selectTab('summary')}>
                                <i className='fa fa-columns'/>
                            </a>
                            <a className={classNames({ active: this.selectedTabKey === 'timeline' })} onClick={() => this.selectTab('timeline')}>
                                <i className='fa argo-icon-timeline'/>
                            </a>
                            <a className={classNames({ active: this.selectedTabKey === 'schedule' })} onClick={() => this.selectTab('schedule')}>
                                <i className='fa argo-icon-schedule'/>
                            </a>
                        </div>
                    ),
                }}>
                <div className={classNames('schedule-details', { 'schedule-details--step-node-expanded': !!selectedNode })}>
                    {this.selectedTabKey === 'summary' && this.renderSummaryTab() || this.state.schedule && (
                        <div>
                            <div className='schedule-details__graph-container'>
                                { this.selectedTabKey === 'schedule' && (
                                    <ScheduleDag
                                        schedule={this.state.schedule}
                                        selectedNodeId={this.selectedNodeId}
                                        nodeClicked={(node) => this.selectNode(node.id)}/>
                                ) || (<ScheduleTimeline
                                        schedule={this.state.schedule}
                                        selectedNodeId={this.selectedNodeId}
                                        nodeClicked={(node) => this.selectNode(node.id)}
                                        ref={(timeline) => this.timelineComponent = timeline}
                                />)}
                            </div>
                            <div className='schedule-details__step-info'>
                                <button className='schedule-details__step-info-close' onClick={() => this.removeNodeSelection()}>
                                    <i className='argo-icon-close'/>
                                </button>
                                {selectedNode && (
                                    <ScheduleNodeInfo
                                        node={selectedNode}
                                        schedule={this.state.schedule}
                                        onShowContainerLogs={(nodeId, container) => this.openContainerLogsPanel(nodeId, container)}
                                        onShowYaml={(nodeId) => this.openNodeYaml(nodeId)}/>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                {this.state.schedule && (
                    <SlidingPanel isShown={this.selectedNodeId && !!this.sidePanel} onClose={() => this.closeSidePanel()}>
                        {this.sidePanel && this.sidePanel.type === 'logs' && <LogsViewer source={{
                            key: this.sidePanel.nodeId,
                            loadLogs: () => services.schedule.getContainerLogs(this.state.schedule, this.sidePanel.nodeId, this.sidePanel.container || 'main'),
                            shouldRepeat: () => this.state.schedule.status.nodes[this.sidePanel.nodeId].phase === 'Running',
                        }} />}
                        {this.sidePanel && this.sidePanel.type === 'yaml' && <ScheduleYamlViewer
                            schedule={this.state.schedule}
                            selectedNode={selectedNode}
                        />}
                    </SlidingPanel>
                )}
            </Page>
        );
    }

    private openNodeYaml(nodeId: string) {
        const params = new URLSearchParams(this.appContext.router.route.location.search);
        params.set('sidePanel', `yaml:${nodeId}`);
        this.appContext.router.history.push(`${this.props.match.url}?${params.toString()}`);
    }

    private openContainerLogsPanel(nodeId: string, container: string) {
        const params = new URLSearchParams(this.appContext.router.route.location.search);
        params.set('sidePanel', `logs:${nodeId}:${container}`);
        this.appContext.router.history.push(`${this.props.match.url}?${params.toString()}`);
    }

    private closeSidePanel() {
        const params = new URLSearchParams(this.appContext.router.route.location.search);
        params.delete('sidePanel');
        this.appContext.router.history.push(`${this.props.match.url}?${params.toString()}`);
    }

    private selectTab(tab: string) {
        this.appContext.router.history.push(`${this.props.match.url}?tab=${tab}&nodeId=${this.selectedNodeId}`);
    }

    private selectNode(nodeId: string) {
        this.appContext.router.history.push(`${this.props.match.url}?tab=${this.selectedTabKey}&nodeId=${nodeId}`);
    }

    private removeNodeSelection() {
        const params = new URLSearchParams(this.appContext.router.route.location.search);
        params.delete('nodeId');
        this.appContext.router.history.push(`${this.props.match.url}?${params.toString()}`);
    }

    private renderSummaryTab() {
        if (!this.state.schedule) {
            return <div>Loading...</div>;
        }
        return (
            <div className='argo-container'>
                <div className='schedule-details__content'>
                    <ScheduleSummaryPanel schedule={this.state.schedule}/>
                    {this.state.schedule.spec.arguments && this.state.schedule.spec.arguments.parameters && (
                        <React.Fragment>
                            <h6>Parameters</h6>
                            <ScheduleParametersPanel parameters={this.state.schedule.spec.arguments.parameters}/>
                        </React.Fragment>
                    )}
                    <h6>Artifacts</h6>
                    <ScheduleArtifacts schedule={this.state.schedule}/>
                </div>
            </div>
        );
    }

    private ensureUnsubscribed() {
        if (this.changesSubscription) {
            this.changesSubscription.unsubscribe();
        }
        this.changesSubscription = null;
    }

    private async loadSchedule(namespace: string, name: string) {
        try {
            this.ensureUnsubscribed();
            const scheduleUpdates = Observable
                .from([await services.schedule.get(namespace, name)])
                .merge(services.schedule.watch({name, namespace}).map((changeEvent) => changeEvent.object));
            this.changesSubscription = scheduleUpdates.subscribe((schedule) => {
                this.setState({ schedule });
            });
        } catch (e) {
            this.appContext.apis.notifications.show({
                content: 'Unable to load schedule',
                type: NotificationType.Error,
            });
        }
    }

    private get appContext(): AppContext {
        return this.context as AppContext;
    }
}
