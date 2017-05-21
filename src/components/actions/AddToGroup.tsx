import * as React from 'react';
import {Action} from '../Action';
import {NodeForm} from '../NodeForm';
import {AddToGroupProps, NodeEditorState} from '../../interfaces';

export class AddToGroup extends Action<AddToGroupProps> {
    renderNode() { return <div>{this.props.name}: {this.props.group}</div> }
}

export class AddToGroupForm extends NodeForm<AddToGroupProps, NodeEditorState> {
    renderForm(): JSX.Element { return <div>Not Implement</div> }
    validate(control: any): string { return null; }
    submit(form: Element) {}
}