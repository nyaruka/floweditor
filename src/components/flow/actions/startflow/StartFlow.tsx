import * as React from 'react';
import { renderAssetList } from 'components/flow/actions/helpers';
import { fakePropType } from 'config/ConfigProvider';
import { StartFlow } from 'flowTypes';
import { AssetType } from 'store/flowContext';

const StartFlowComp: React.SFC<StartFlow> = (
  { flow: { name, uuid } },
  context: any
): JSX.Element => (
  <>{renderAssetList([{ name, id: uuid, type: AssetType.Flow }], 3, context.config.endpoints)}</>
);

StartFlowComp.contextTypes = {
  config: fakePropType
};

export default StartFlowComp;
