import * as React from 'react';
import { CallWebhook } from '../../../flowTypes';

const WebhookComp: React.SFC<CallWebhook> = ({ url }): JSX.Element => <div>{url}</div>;

export default WebhookComp;
