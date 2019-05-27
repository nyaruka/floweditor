import * as React from 'react';
import { CallWebhook } from 'flowTypes';

const CallWebhookComp: React.SFC<CallWebhook> = ({ url }): JSX.Element => <div>{url}</div>;

export default CallWebhookComp;
