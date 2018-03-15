import * as React from 'react';
import { SendMsg } from '../../../flowTypes';
import { Language } from '../../LanguageSelector';
import { LocalizedObject } from '../../../services/Localization';
import ComponentMap from '../../../services/ComponentMap';
import TextInputElement, { Count } from '../../form/TextInputElement';
import CheckboxElement from '../../form/CheckboxElement';
import { Type } from '../../../config';
import * as styles from '../../actions/Action/Action.scss';
import { UpdateLocalizations } from '../../NodeEditor';

export interface SendMsgFormProps {
    language: Language;
    action: SendMsg;
    showAdvanced: boolean;
    config: Type;
    translating: boolean;
    ComponentMap: ComponentMap;
    updateAction(action: SendMsg): void;
    onBindWidget(ref: any): void;
    onBindAdvancedWidget(ref: any): void;
    updateLocalizations: UpdateLocalizations;
    getLocalizedObject(): LocalizedObject;
}

export default class SendMsgForm extends React.Component<SendMsgFormProps> {
    constructor(props: SendMsgFormProps) {
        super(props);

        this.onValid = this.onValid.bind(this);
    }

    public onValid(widgets: { [name: string]: any }): void {
        const textarea = widgets.Message as TextInputElement;
        const sendAll = widgets['All Destinations'] as CheckboxElement;

        if (this.props.translating) {
            const translation = textarea.state.value.trim();

            if (translation) {
                this.props.updateLocalizations(this.props.language.iso, [
                    { uuid: this.props.action.uuid, translations: { text: [textarea.state.value] } }
                ]);
            } else {
                this.props.updateLocalizations(this.props.language.iso, [
                    { uuid: this.props.action.uuid, translations: null }
                ]);
            }
        } else {
            const newAction: SendMsg = {
                uuid: this.props.action.uuid,
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

            translation = (
                <div data-spec="translation-container">
                    <div data-spec="text-to-translate" className={styles.translate_from}>
                        {textToTrans}
                    </div>
                </div>
            );

            placeholder = `${this.props.language.name} Translation`;

            if (localizedObject.isLocalized()) {
                ({ text } = localizedObject.getObject() as SendMsg);
            }
        } else {
            ({ text } = this.props.action);
        }

        const required: boolean = !this.props.translating;

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
                    autocomplete={true}
                    focus={true}
                    required={required}
                    textarea={true}
                    ComponentMap={this.props.ComponentMap}
                    config={this.props.config}
                />
            </div>
        );
    }

    private renderAdvanced(): JSX.Element {
        return (
            <CheckboxElement
                ref={this.props.onBindAdvancedWidget}
                name="All Destinations"
                defaultValue={this.props.action.all_urns}
                description="Send a message to all destinations known for this contact."
            />
        );
    }

    public render(): JSX.Element {
        return this.props.showAdvanced ? this.renderAdvanced() : this.renderForm();
    }
}
