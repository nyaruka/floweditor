import * as React from 'react';
import { renderAssetList } from 'components/flow/actions/helpers';
import { fakePropType } from 'config/ConfigProvider';
import { AddLabels } from 'flowTypes';
import { AssetType } from 'store/flowContext';

export const MAX_TO_SHOW = 3;

const AddLabelsComp: React.SFC<AddLabels> = ({ labels }, context: any): JSX.Element => (
  <>
    {renderAssetList(
      labels.map(label => {
        return { id: label.uuid, name: label.name, type: AssetType.Label };
      }),
      MAX_TO_SHOW,
      context.config.endpoints
    )}
  </>
);

AddLabelsComp.contextTypes = {
  config: fakePropType
};

export default AddLabelsComp;
