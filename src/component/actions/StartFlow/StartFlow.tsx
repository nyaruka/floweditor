import * as React from 'react';
import { StartFlow } from '../../../flowTypes';
import * as styles from './StartFlow.scss';

// tslint:disable-next-line:variable-name
export const getStartFlowMarkup = (flow_name: string) => (
    <div className={styles.startFlow}>{flow_name}</div>
);

const StartFlowComp: React.SFC<StartFlow> = ({ flow_name }): JSX.Element =>
    getStartFlowMarkup(flow_name);

export default StartFlowComp;
