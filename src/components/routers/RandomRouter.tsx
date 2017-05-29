import * as React from 'react';
import {NodeForm} from '../NodeForm';
import {RandomRouterProps, NodeEditorState} from '../../interfaces';
import {NodeModalProps} from '../NodeModal';

export class RandomRouterForm extends NodeForm<RandomRouterProps, NodeEditorState> {
    renderForm(): JSX.Element { return <div>Not Implemented</div> }
    validate(control: any): string { return null; }
    submit(modal: NodeModalProps) {}
}

export default RandomRouterForm;