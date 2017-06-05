import * as React from 'react';
import { ActionComp, ActionProps } from '../Action';
import { ActionForm } from '../NodeForm';
import { SendMessage } from '../../FlowDefinition';
import { NodeModalProps } from '../NodeModal';
import { TextAreaElement } from '../form/TextInputElement';

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

export class SendMessageForm extends ActionForm<SendMessage, {}> {

    renderForm(): JSX.Element {
        return (
            <TextAreaElement ref={this.ref.bind(this)} name="Message" showLabel={false} value={this.getAction().text} required />
        )
    }

    submit(modal: NodeModalProps) {
        var textarea = this.getElements()[0] as TextAreaElement;

        var newAction: SendMessage = {
            uuid: this.getUUID(),
            type: this.props.config.type,
            text: textarea.state.value,
        }
        modal.onUpdateAction(newAction);
    }
}