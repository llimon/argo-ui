import createHistory from 'history/createBrowserHistory';
import * as PropTypes from 'prop-types';
import * as React from 'react';
import { Redirect, Route, RouteComponentProps, Router, Switch } from 'react-router';

import { uiUrl } from './shared/base';
import { Layout, Notifications, NotificationsManager, Popup, PopupManager, PopupProps } from './shared/components';
import { AppContext } from './shared/context';

export const history = createHistory();

import help from './help';
import workflows from './workflows';
import schedule from './schedule';

const workflowsUrl = uiUrl('workflows');
const helpUrl = uiUrl('help');
const timelineUrl = uiUrl('timeline');
const calendarUrl= uiUrl('calendar');
const scheduleUrl = uiUrl('schedule');

const routes: {[path: string]: { component: React.ComponentType<RouteComponentProps<any>> } } = {
    [workflowsUrl]: { component: workflows.component },
    [scheduleUrl]: { component: schedule.component},
    [helpUrl]: { component: help.component },
};

const navItems = [{
    title: 'Timeline',
    path: workflowsUrl,
    iconClassName: 'argo-icon-timeline',
}, {
    title: 'Calendar',
    path: scheduleUrl,
    iconClassName: 'argo-icon-calendar',
}, {
    title: 'Help',
    path: helpUrl,
    iconClassName: 'argo-icon-docs',
}
];

export class App extends React.Component<{}, { popupProps: PopupProps }> {
    public static childContextTypes = {
        history: PropTypes.object,
        apis: PropTypes.object,
    };

    private popupManager: PopupManager;
    private notificationsManager: NotificationsManager;

    constructor(props: {}) {
        super(props);
        this.state = { popupProps: null };
        this.popupManager = new PopupManager();
        this.notificationsManager = new NotificationsManager();
    }

    public componentDidMount() {
        this.popupManager.popupProps.subscribe((popupProps) => this.setState({ popupProps }));
    }

    public render() {
        return (
            <div>
                {this.state.popupProps && <Popup {...this.state.popupProps}/>}
                <Router history={history}>
                    <Switch>
                        <Redirect exact={true} path={uiUrl('')} to={workflowsUrl}/>
                        <Route path={timelineUrl} component={ class ToWorkflows extends React.Component {
                            public static contextTypes = { router: PropTypes.object };
                            public render() {return <div/>; }
                            public componentWillMount() {
                                const router = (this.context as AppContext).router;
                                router.history.push(router.route.location.pathname.replace(timelineUrl, workflowsUrl));
                            }
                        } }/>
                        <Route path={calendarUrl} component={ class ToSchedule extends React.Component {
                            public static contextTypes = { router: PropTypes.object };
                            public render() {return <div/>; }
                            public componentWillMount() {
                                const router = (this.context as AppContext).router;
                                router.history.push(router.route.location.pathname.replace(calendarUrl, scheduleUrl));
                                //router.history.push(router.route.location.pathname);
                            }
                        } }/>

                        <Layout navItems={navItems}>
                            <Notifications notifications={this.notificationsManager.notifications}/>
                            {Object.keys(routes).map((path) => {
                                const route = routes[path];
                                return <Route key={path} path={path} component={route.component}/>;
                            })}
                        </Layout>
                    </Switch>
                </Router>
            </div>
        );
    }

    public getChildContext() {
        return { history, apis: { popup: this.popupManager, notifications: this.notificationsManager } };
    }
}
