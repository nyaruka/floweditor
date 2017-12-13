import * as React from 'react';
import { Reply } from '../../../flowTypes';
import { Type } from '../../../providers/ConfigProvider/typeConfigs';
import ComponentMap from '../../../services/ComponentMap';
import TextInputElement, { Count } from '../../form/TextInputElement';
import CheckboxElement from '../../form/CheckboxElement';

const styles = require('../../Action/Action.scss');

export interface ReplyFormProps {
    action: Reply;
    showAdvanced: boolean;
    config: Type;
    translating: boolean;
    ComponentMap: ComponentMap;
    updateAction(action: Reply): void;
    onBindWidget(ref: any): void;
    onBindAdvancedWidget(ref: any): void;
    updateLocalizations(language: string, changes: { uuid: string; translations: any }[]): void;
    getLocalizedObject: Function;
    getActionUUID: Function;
}

export default class ReplyForm extends React.Component<ReplyFormProps> {
    constructor(props: ReplyFormProps) {
        super(props);

        this.onValid = this.onValid.bind(this);
    }

    public onValid(widgets: { [name: string]: any }): void {
        const localizedObject = this.props.getLocalizedObject();

        const textarea = widgets['Message'] as TextInputElement;
        const sendAll = widgets['All Destinations'] as CheckboxElement;

        if (localizedObject) {
            const translation = textarea.state.value.trim();

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
            let newAction: Reply = {
                uuid: this.props.getActionUUID(),
                type: this.props.config.type,
                text: textarea.state.value
            };

            if (sendAll.state.checked) {
                newAction.all_urns = true;
            }

            this.props.updateAction(newAction);
        }
    }

    private renderForm(): JSX.Element {
        let text: string = '';
        let placeholder: string = '';
        let translation: JSX.Element = null;

        if (this.props.translating) {
            const localizedObject = this.props.getLocalizedObject();
            const { text: textToTrans } = this.props.action;
            const { name } = localizedObject.getLanguage();

            translation = (
                <div data-spec="translation-container" className={styles.translation}>
                    <div data-spec="text-to-translate" className={styles.translate_from}>
                        {textToTrans}
                    </div>
                </div>
            );

            placeholder = `${name} Translation`;

            if (localizedObject.isLocalized()) {
                ({ text } = localizedObject.getObject());
            }
        } else {
            this.props.action && ({ text } = this.props.action);
        }

        return (
            <div>
                {translation}
                <TextInputElement
                    ref={this.props.onBindWidget}
                    name="Message"
                    showLabel={false}
                    count={Count.SMS}
                    value={text}
                    placeholder={placeholder}
                    autocomplete
                    focus
                    required={!this.props.translating}
                    textarea
                    ComponentMap={this.props.ComponentMap}
                />
            </div>
        );
    }

    private renderAdvanced(): JSX.Element {
        let sendAll: boolean;

        if (this.props.action) {
            sendAll = this.props.action.all_urns;
        } else {
            sendAll = false;
        }

        return (
            <CheckboxElement
                ref={this.props.onBindAdvancedWidget}
                name="All Destinations"
                defaultValue={sendAll}
                description="Send a message to all destinations known for this contact."
            />
        );
    }

    public render(): JSX.Element {
        return this.props.showAdvanced ? this.renderAdvanced() : this.renderForm();
    }
}
