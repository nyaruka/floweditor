import * as React from 'react';
import { CallLLM } from 'flowTypes';
import { ellipsize } from 'utils';

const CallLLMComp: React.SFC<CallLLM> = ({ instructions }): JSX.Element => (
  <div>{ellipsize(instructions, 150)}</div>
);

export default CallLLMComp;
