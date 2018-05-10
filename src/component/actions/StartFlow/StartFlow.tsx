import * as React from 'react';

import { StartFlow } from '../../../flowTypes';
import { AssetType } from '../../../services/AssetService';
import { renderAssetList } from '../helpers';
import * as styles from './StartFlow.scss';

// tslint:disable-next-line:variable-name
export const getStartFlowMarkup = (name: string) => <div className={styles.startFlow}>{name}</div>;

const StartFlowComp: React.SFC<StartFlow> = ({ flow: { name, uuid } }): JSX.Element => (
    <>{renderAssetList([{ name, id: uuid, type: AssetType.Flow }])}</>
);
getStartFlowMarkup(name);

export default StartFlowComp;
