import * as React from 'react';
import { renderAssetList } from '~/components/flow/actions/helpers';
import { StartFlow } from '~/flowTypes';
import { AssetType } from '~/services/AssetService';

const StartFlowComp: React.SFC<StartFlow> = ({ flow: { name, uuid } }): JSX.Element => (
    <>{renderAssetList([{ name, id: uuid, type: AssetType.Flow }])}</>
);

export default StartFlowComp;
