import * as React from 'react';
import { CallClassifier, MissingDependencies, Classifier } from 'flowTypes';
import { Trans } from 'react-i18next';
import { renderAsset } from '../helpers';
import { AssetType } from 'store/flowContext';
import { fakePropType } from 'config/ConfigProvider';

const CallClassifierComp: React.SFC<CallClassifier & MissingDependencies> = (
  { classifier, missingDependencies },
  context: any
): JSX.Element => {
  return renderAsset(
    {
      id: classifier.uuid,
      name: classifier.name,
      type: AssetType.Classifier,
      missing: missingDependencies.length > 0
    },
    context.config.endpoints
  );
};

CallClassifierComp.contextTypes = {
  config: fakePropType
};

export default CallClassifierComp;
