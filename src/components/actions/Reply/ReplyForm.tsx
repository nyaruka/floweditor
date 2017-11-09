import * as React from 'react';
import { IReply } from '../../../flowTypes';
import { IType } from '../../../services/EditorConfig';
import ComponentMap from '../../../services/ComponentMap';
import { TextInputElement } from '../../form/TextInputElement';
import Widget from '../../NodeEditor/Widget';
import { CheckboxElement } from '../../form/CheckboxElement';

const styles = require('../../Action/Action.scss');

export interface IReplyFormProps {
    action: IReply;
    advanced: boolean;
    config: IType;
    ComponentMap: ComponentMap;
    updateAction(action: IReply): void;
    onBindWidget(ref: any): void;
    onBindAdvancedWidget(ref: any): void;
    updateLocalizations(language: string, changes: { uuid: string; translations: any }[]): void;
    validationCallback: Function;
    getLocalizedObject: Function;
    getActionUUID: Function;
    getInitialAction(): IReply;
}

export default ({
    action,
    advanced,
    config,
    ComponentMap,
    updateAction,
    onBindWidget,
    onBindAdvancedWidget,
    updateLocalizations,
    validationCallback,
    getLocalizedObject,
    getActionUUID,
    getInitialAction
}: IReplyFormProps): JSX.Element => {
    /** Register this form's validationCallback callback (make it available on NodeEditorForm for NodeEditor to access) */
    validationCallback((widgets: { [name: string]: Widget }) => {
        const localizedObject = getLocalizedObject();

        const textarea = widgets['Message'] as TextInputElement;
        const sendAll = widgets['All Destinations'] as CheckboxElement;

        if (localizedObject) {
            const translation = textarea.state.value.trim();

            if (translation) {
                updateLocalizations(localizedObject.getLanguage().iso, [
                    { uuid: action.uuid, translations: { text: [textarea.state.value] } }
                ]);
            } else {
                updateLocalizations(localizedObject.getLanguage().iso, [
                    { uuid: action.uuid, translations: null }
                ]);
            }
        } else {
            const newAction: IReply = {
                uuid: getActionUUID(),
                type: config.type,
                text: textarea.state.value
            };

            if (sendAll.state.checked) {
                newAction.all_urns = true;
            }

            updateAction(newAction);
        }
    });

    const renderForm = (): JSX.Element => {
        let text = '';
        const initialAction = getInitialAction();

        if (initialAction && initialAction.type === 'reply') {
            ({ text } = initialAction);
        }

        let translation;
        let placeholder;

        const localizedObject = getLocalizedObject();

        if (localizedObject) {
            placeholder = `${localizedObject.getLanguage().name} Translation`;

            translation = (
                <div className={styles.translation}>
                    <div className={styles.translate_from}>{text}</div>
                </div>
            );

            if (localizedObject.hasTranslation('text')) {
                ({ text } = localizedObject.getObject());
            }
        }

        return (
            <div>
                {translation}
                <TextInputElement
                    ref={onBindWidget}
                    name="Message"
                    showLabel={false}
                    value={text}
                    placeholder={placeholder}
                    autocomplete
                    required={localizedObject == null}
                    textarea
                    ComponentMap={ComponentMap}
                />
            </div>
        );
    };

    const renderAdvanced = (): JSX.Element => {
        let sendAll;
        const initialAction = getInitialAction();

        if (initialAction) {
            const { all_urns } = initialAction as IReply;
            sendAll = all_urns;
        } else {
            sendAll = false;
        }

        return (
            <CheckboxElement
                ref={onBindAdvancedWidget}
                name="All Destinations"
                defaultValue={sendAll}
                description="Send a message to all destinations known for this contact."
            />
        );
    };

    return advanced ? renderAdvanced() : renderForm();
};
