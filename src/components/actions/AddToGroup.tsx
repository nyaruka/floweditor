import * as React from 'react';
import {ActionComp} from '../ActionComp';
import {NodeFormComp} from '../NodeFormComp';
import {AddToGroupProps, NodeEditorState} from '../../interfaces';

export class AddToGroup extends ActionComp<AddToGroupProps> {
    renderNode() { return <div>AddToGroup</div> }
}

export class AddToGroupForm extends NodeFormComp<AddToGroupProps, NodeEditorState> {
    renderForm(): JSX.Element { return <div>Not Implement</div> }
    validate(control: any): string { return null; }
    submit(form: Element) {}
}