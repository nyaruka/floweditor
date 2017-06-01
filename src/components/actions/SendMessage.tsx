import * as React from 'react';
import { NodeEditorState } from '../../interfaces';
import { ActionComp, ActionProps } from '../Action';
import { NodeForm } from '../NodeForm';
import { SendMessageProps } from '../../interfaces';
import { SendMessage } from '../../FlowDefinition';
import { NodeModalProps } from '../NodeModal';
import { TextAreaElement } from '../form/TextAreaElement';

export class SendMessageComp extends ActionComp<SendMessage> {
    renderNode(): JSX.Element {
        var action = this.getAction();
        if (action.text) {
            return <div>{action.text}</div>
        } else {
            return <div className='placeholder'>Send a message to the contact</div>
        }
    }
}

export class SendMessageForm extends NodeForm<SendMessageProps, NodeEditorState> {

    renderForm(): JSX.Element {
        return (
            <TextAreaElement ref={this.ref.bind(this)} name="Message" showLabel={false} value={this.props.text} required />
        )
    }

    submit(modal: NodeModalProps) {
        var textarea = this.getElements()[0] as TextAreaElement;
        modal.onUpdateAction({
            uuid: this.props.uuid,
            type: "reply",
            text: textarea.state.value,
        } as SendMessageProps);
    }
}