import * as React from 'react';
import { CallWebhook } from '../../../flowTypes';

const CallWebhookComp: React.SFC<CallWebhook> = ({ url }): JSX.Element => (
    <React.Fragment>{url}</React.Fragment>
);

export default CallWebhookComp;
