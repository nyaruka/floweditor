import * as React from 'react';
import { ActionComp } from '../Action';
import { Webhook } from '../../FlowDefinition';

export class WebhookComp extends ActionComp<Webhook> {
    renderNode(): JSX.Element {
        return <div>{this.getAction().url}</div>
    }
}