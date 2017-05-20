import * as React from 'react';
import {NodeFormComp} from '../NodeForm';
import {RandomRouterProps, NodeEditorState} from '../../interfaces';

export class RandomRouterForm extends NodeFormComp<RandomRouterProps, NodeEditorState> {
    renderForm(): JSX.Element { return <div>Not Implement</div> }
    validate(control: any): string { return null; }
    submit(form: Element) {}
}

export default RandomRouterForm;