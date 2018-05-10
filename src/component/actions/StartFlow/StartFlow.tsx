import * as React from 'react';

import { StartFlow } from '../../../flowTypes';
import { AssetType } from '../../../services/AssetService';
import { renderAssetList } from '../helpers';

const StartFlowComp: React.SFC<StartFlow> = ({ flow: { name, uuid } }): JSX.Element => (
    <>{renderAssetList([{ name, id: uuid, type: AssetType.Flow }])}</>
);

export default StartFlowComp;
