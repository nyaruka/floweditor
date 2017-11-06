import * as React from 'react';
import { ActionComp } from '../Action';
import { IWebhook } from '../../flowTypes';

export class WebhookComp extends ActionComp<IWebhook> {
    renderNode(): JSX.Element {
        return <div>{this.getAction().url}</div>;
    }
}
