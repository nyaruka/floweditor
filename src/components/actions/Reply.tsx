import * as React from 'react';
import { ActionComp, ActionProps } from '../Action';
import { Reply } from '../../FlowDefinition';
import { TextInputElement } from '../form/TextInputElement';
import { NodeActionForm, Widget } from "../NodeEditor";
import { CheckboxElement } from "../form/CheckboxElement";

var styles = require('../Action.scss');

export class ReplyComp extends ActionComp<Reply> {

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

export class ReplyForm extends NodeActionForm<Reply> {
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
                text = (localizedObject.getObject() as Reply).text;
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

    renderAdvanced(ref: any): JSX.Element {
        var action = this.getInitial();
        var sendAll = false;
        if (action) {
            sendAll = action.all_urns;
        }
        return <CheckboxElement ref={ref} name="All Destinations" defaultValue={sendAll} description="Send a message to all destinations known for this contact." />
    }

    onValid(widgets: { [name: string]: Widget }) {
        var localizedObject = this.getLocalizedObject();
        var textarea = widgets["Message"] as TextInputElement;
        var sendAll = widgets["All Destinations"] as CheckboxElement;

        if (localizedObject) {
            var translation = textarea.state.value.trim();
            if (translation) {
                this.props.updateLocalizations(localizedObject.getLanguage().iso, [{ uuid: this.props.action.uuid, translations: { text: [textarea.state.value] } }]);
            } else {
                this.props.updateLocalizations(localizedObject.getLanguage().iso, [{ uuid: this.props.action.uuid, translations: null }]);
            }

        } else {
            var newAction: Reply = {
                uuid: this.getActionUUID(),
                type: this.props.config.type,
                text: textarea.state.value,
            }

            if (sendAll.state.checked) {
                newAction.all_urns = true;
            }

            this.props.updateAction(newAction);
        }
    }
}