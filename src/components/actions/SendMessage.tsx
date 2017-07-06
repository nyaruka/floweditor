import * as React from 'react';
import { ActionComp, ActionProps } from '../Action';
import { SendMessage } from '../../FlowDefinition';
import { TextInputElement } from '../form/TextInputElement';
import { NodeActionForm } from "../NodeEditor";

var styles = require('../Action.scss');

export class SendMessageComp extends ActionComp<SendMessage> {

    localizedKeys = ["text"];

    renderNode(): JSX.Element {
        var action = this.getAction();
        if (action.text != null) {
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

        var translation = null;

        var localizedObject = this.getLocalizedObject();
        var placeholder = null;
        if (localizedObject) {
            placeholder = localizedObject.getLanguage().name + " Translation";
            translation = (
                <div className={styles.translation}>
                    <div className={styles.translate_from}>
                        {text}
                    </div>
                </div>
            )

            if (localizedObject.hasTranslation("text")) {
                text = (localizedObject.getObject() as SendMessage).text;
            } else {
                text = "";
            }
        }

        return (
            <div>
                {translation}
                <TextInputElement ref={ref} name="Message" showLabel={false} value={text} placeholder={placeholder} autocomplete required={localizedObject == null} textarea />
            </div>
        )
    }

    onValid() {
        var localizedObject = this.getLocalizedObject();
        var textarea = this.getWidget("Message") as TextInputElement;

        if (localizedObject) {
            var translation = textarea.state.value.trim();
            if (translation) {
                this.props.updateLocalizations(localizedObject.getLanguage().iso, [{ uuid: this.props.action.uuid, translations: { text: [textarea.state.value] } }]);
            } else {
                this.props.updateLocalizations(localizedObject.getLanguage().iso, [{ uuid: this.props.action.uuid, translations: null }]);
            }

        } else {
            var newAction: SendMessage = {
                uuid: this.getActionUUID(),
                type: this.props.config.type,
                text: textarea.state.value,
            }
            this.props.updateAction(newAction);
        }
    }
}