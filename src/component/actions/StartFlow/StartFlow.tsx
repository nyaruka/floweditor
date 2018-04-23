import * as React from 'react';
import { StartFlow } from '../../../flowTypes';
import * as styles from './StartFlow.scss';

// tslint:disable-next-line:variable-name
export const getStartFlowMarkup = (name: string) => <div className={styles.startFlow}>{name}</div>;

const StartFlowComp: React.SFC<StartFlow> = ({ flow: { name } }): JSX.Element =>
    getStartFlowMarkup(name);

export default StartFlowComp;
