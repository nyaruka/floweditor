import * as React from 'react';
import {ActionComp} from '../ActionComp';
import {NodeFormComp} from '../NodeFormComp';
import {SetLanguageProps, NodeEditorState} from '../../interfaces';

export class SetLanguage extends ActionComp<SetLanguageProps> {
    renderNode() { return <div>Language</div> }
}

export class SetLanguageForm extends NodeFormComp<SetLanguageProps, NodeEditorState> {
    renderForm(): JSX.Element { return <div>Not Implement</div> }
    validate(control: any): string { return null; }
    submit(form: Element) {}
}