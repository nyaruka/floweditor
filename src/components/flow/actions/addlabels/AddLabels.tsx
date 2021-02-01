import * as React from 'react';
import { renderAssetList } from 'components/flow/actions/helpers';
import { fakePropType } from 'config/ConfigProvider';
import { AddLabels } from 'flowTypes';
import { AssetType } from 'store/flowContext';

export const MAX_TO_SHOW = 5;

const AddLabelsComp: React.SFC<AddLabels> = ({ labels }, context: any): JSX.Element => {
  return (
    <>
      {renderAssetList(
        labels.map(label => {
          if (label.name_match) {
            return {
              id: label.name_match,
              name: label.name_match,
              type: AssetType.NameMatch
            };
          }
          return {
            id: label.uuid,
            name: label.name,
            type: AssetType.Label
          };
        }),
        MAX_TO_SHOW,
        context.config.endpoints
      )}
    </>
  );
};

AddLabelsComp.contextTypes = {
  config: fakePropType
};

export default AddLabelsComp;
