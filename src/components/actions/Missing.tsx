import * as React from 'react';
import {ActionComp} from '../ActionComp';
import {NodeFormComp} from '../NodeFormComp';
import {WebhookProps, NodeEditorProps, NodeEditorState} from '../../interfaces';

export class Missing extends ActionComp<NodeEditorProps> {
    renderNode(): JSX.Element {
        return <div className="url breaks">Not Implemented</div>
    }
}