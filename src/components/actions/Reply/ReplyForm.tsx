import * as React from 'react';
import { IReply } from '../../../flowTypes';
import { TextInputElement } from '../../form/TextInputElement';
import NodeActionForm from '../../NodeEditor/NodeActionForm';
import Widget from '../../NodeEditor/Widget';
import { CheckboxElement } from '../../form/CheckboxElement';

const styles = require('../../enhancers/withAction.scss');

class ReplyForm extends NodeActionForm<IReply> {
    renderForm(ref: any): JSX.Element {
        var text = '';
        var action = this.getInitial();
        if (action && action.type == 'reply') {
            text = action.text;
        }

        var translation = null;

        var localizedObject = this.getLocalizedObject();
        var placeholder = null;
        if (localizedObject) {
            placeholder = localizedObject.getLanguage().name + ' Translation';
            translation = (
                <div className={styles.translation}>
                    <div className={styles.translate_from}>{text}</div>
                </div>
            );

            if (localizedObject.hasTranslation('text')) {
                text = (localizedObject.getObject() as IReply).text;
            } else {
                text = '';
            }
        }

        return (
            <div>
                {translation}
                <TextInputElement
                    ref={ref}
                    name="Message"
                    showLabel={false}
                    value={text}
                    placeholder={placeholder}
                    autocomplete
                    required={localizedObject == null}
                    textarea
                    ComponentMap={this.props.ComponentMap}
                />
            </div>
        );
    }

    renderAdvanced(ref: any): JSX.Element {
        var action = this.getInitial();
        var sendAll = false;
        if (action) {
            sendAll = action.all_urns;
        }
        return (
            <CheckboxElement
                ref={ref}
                name="All Destinations"
                defaultValue={sendAll}
                description="Send a message to all destinations known for this contact."
            />
        );
    }

    onValid(widgets: { [name: string]: Widget }) {
        var localizedObject = this.getLocalizedObject();
        var textarea = widgets['Message'] as TextInputElement;
        var sendAll = widgets['All Destinations'] as CheckboxElement;

        if (localizedObject) {
            var translation = textarea.state.value.trim();
            if (translation) {
                this.props.updateLocalizations(localizedObject.getLanguage().iso, [
                    { uuid: this.props.action.uuid, translations: { text: [textarea.state.value] } }
                ]);
            } else {
                this.props.updateLocalizations(localizedObject.getLanguage().iso, [
                    { uuid: this.props.action.uuid, translations: null }
                ]);
            }
        } else {
            var newAction: IReply = {
                uuid: this.getActionUUID(),
                type: this.props.config.type,
                text: textarea.state.value
            };

            if (sendAll.state.checked) {
                newAction.all_urns = true;
            }

            this.props.updateAction(newAction);
        }
    }
}

export default ReplyForm;
