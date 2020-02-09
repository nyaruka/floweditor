import * as React from 'react';
import { renderAssetList } from 'components/flow/actions/helpers';
import { fakePropType } from 'config/ConfigProvider';
import { AddLabels, MissingDependencies, Dependency } from 'flowTypes';
import { AssetType } from 'store/flowContext';

export const MAX_TO_SHOW = 5;

const AddLabelsComp: React.SFC<AddLabels & MissingDependencies> = (
  { labels, missingDependencies },
  context: any
): JSX.Element => {
  return (
    <>
      {renderAssetList(
        labels.map(label => {
          return {
            id: label.uuid,
            name: label.name,
            type: AssetType.Label,
            missing: !!missingDependencies.find((dep: Dependency) => dep.uuid === label.uuid)
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
