import * as React from 'react';
import { SetRunResult } from 'flowTypes';
import { ellipsize, emphasize } from 'utils';

export const getSavePlaceholder = (value: string, name: string): JSX.Element => (
  <div>
    Save {emphasize(ellipsize(value, 100))} as {emphasize(name)}
  </div>
);

export const getClearPlaceholder = (name: string) => <div>Clear value for {emphasize(name)}</div>;

const SetRunResultComp: React.SFC<SetRunResult> = ({ value, name }): JSX.Element => {
  if (value) {
    return getSavePlaceholder(value, name);
  }
  return getClearPlaceholder(name);
};

export default SetRunResultComp;
