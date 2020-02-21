import * as React from 'react';
import { CallClassifier } from 'flowTypes';
import { renderAsset } from '../helpers';
import { AssetType } from 'store/flowContext';
import { fakePropType } from 'config/ConfigProvider';

const CallClassifierComp: React.SFC<CallClassifier> = (
  { classifier },
  context: any
): JSX.Element => {
  return renderAsset(
    {
      id: classifier.uuid,
      name: classifier.name,
      type: AssetType.Classifier
    },
    context.config.endpoints
  );
};

CallClassifierComp.contextTypes = {
  config: fakePropType
};

export default CallClassifierComp;
