import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router';
import { ScheduleDetails } from './schedule-details/schedule-details';
import { ScheduleList } from './schedule-list/schedule-list';

export const ScheduleContainer = (props: RouteComponentProps<any>) => (
    <Switch>
        <Route exact={true} path={`${props.match.path}`} component={ScheduleList}/>
        <Route exact={true} path={`${props.match.path}/:namespace/:name`} component={ScheduleDetails}/>
    </Switch>
);
