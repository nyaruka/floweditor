import * as React from 'react';
import { StartFlow } from '../../../flowTypes';

import * as styles from './StartFlow.scss';

const StartFlowComp: React.SFC<StartFlow> = ({ flow_name }): JSX.Element => (
    <div className={styles.flowName}>{flow_name}</div>
);

export default StartFlowComp;
