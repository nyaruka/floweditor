import * as React from 'react';
import {Action} from '../Action';
import {WebhookProps, NodeEditorProps, NodeEditorState} from '../../interfaces';

export class Missing extends Action<NodeEditorProps> {
    renderNode(): JSX.Element {
        return <div className="url breaks">Not Implemented</div>
    }
}