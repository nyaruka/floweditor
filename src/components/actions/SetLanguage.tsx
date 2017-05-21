import * as React from 'react';
import {Action} from '../Action';
import {NodeForm} from '../NodeForm';
import {SetLanguageProps, NodeEditorState} from '../../interfaces';

export class SetLanguage extends Action<SetLanguageProps> {
    renderNode() { return <div>Language</div> }
}

export class SetLanguageForm extends NodeForm<SetLanguageProps, NodeEditorState> {
    renderForm(): JSX.Element { return <div>Not Implement</div> }
    validate(control: any): string { return null; }
    submit(form: Element) {}
}