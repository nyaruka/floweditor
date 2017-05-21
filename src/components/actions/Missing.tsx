import * as React from 'react';
import {Action} from '../Action';
import {ActionProps} from '../../interfaces';

export class Missing extends Action<ActionProps> {
    renderNode(): JSX.Element {
        return <div className="url breaks">Not Implemented</div>
    }
}