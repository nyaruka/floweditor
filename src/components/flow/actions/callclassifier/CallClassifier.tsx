import * as React from 'react';
import { CallClassifier } from 'flowTypes';

const CallClassifierComp: React.SFC<CallClassifier> = ({
  result_name,
  classifier
}): JSX.Element => <div>Call {classifier.name} classifier</div>;

export default CallClassifierComp;
