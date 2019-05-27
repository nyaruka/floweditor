import * as React from 'react';
import { CallResthook } from 'flowTypes';

const CallResthookComp: React.SFC<CallResthook> = ({ resthook }): JSX.Element => (
  <div>{resthook}</div>
);

export default CallResthookComp;
