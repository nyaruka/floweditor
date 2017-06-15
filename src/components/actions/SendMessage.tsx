import * as React from 'react';
import { ActionComp, ActionProps } from '../Action';
import { SendMessage } from '../../FlowDefinition';
import { NodeModal } from '../NodeModal';
import { TextInputElement } from '../form/TextInputElement';
import { NodeActionForm } from "../NodeEditor";

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

export class SendMessageForm extends NodeActionForm<SendMessage> {
    renderForm(ref: any): JSX.Element {
        var text = "";
        var action = this.getInitial();
        if (action && action.type == "reply") {
            text = action.text;
        }

        return <TextInputElement ref={ref} name="Message" showLabel={false} value={text} autocomplete required textarea />
    }

    onValid() {
        var textarea = this.getWidget("Message") as TextInputElement;
        var newAction: SendMessage = {
            uuid: this.getActionUUID(),
            type: this.props.config.type,
            text: textarea.state.value,
        }
        this.props.updateAction(newAction);
    }
}