import * as React from 'react';
import {NodeForm} from '../NodeForm';
import {RandomRouterProps, NodeEditorState} from '../../interfaces';

export class RandomRouterForm extends NodeForm<RandomRouterProps, NodeEditorState> {
    renderForm(): JSX.Element { return <div>Not Implemented</div> }
    validate(control: any): string { return null; }
    submit(form: Element) {}
}

export default RandomRouterForm;