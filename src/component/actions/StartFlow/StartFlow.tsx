import * as React from 'react';
import { StartFlow } from '../../../flowTypes';

import { startFlow } from './StartFlow.scss';

const StartFlowComp: React.SFC<StartFlow> = ({ flow_name }): JSX.Element => (
    <div className={startFlow}>{flow_name}</div>
);

export default StartFlowComp;
