import * as React from 'react';
import { CallWebhook } from 'flowTypes';
import { ellipsize } from 'utils';

const CallWebhookComp: React.SFC<CallWebhook> = ({ url }): JSX.Element => (
  <div>{ellipsize(url, 150)}</div>
);

export default CallWebhookComp;
