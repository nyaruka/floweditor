import * as React from 'react';
import { IStartFlow } from '../../../flowTypes';
import withAction from '../../enhancers/withAction';

export const StartFlowCompBase = ({ flow_name }: IStartFlow) => <div>{flow_name}</div>;

export default withAction()(StartFlowCompBase);
